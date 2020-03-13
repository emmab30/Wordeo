import React, { Component } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    PanResponder,
    View,
    Platform,
    Text,
    ActivityIndicator
} from 'react-native';

const { width } = Dimensions.get('window');
const mainWidth = (width / 10) * 7.4;

import { Color, Font } from '../../styles/default';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';

export default class MultiSlider extends Component {
    constructor(props) {
        super(props);
        this.state = {
            widthSelected: new Animated.Value(0),
            widthUnselected: new Animated.Value(0),
            options: [],
            isComponentReady: false,
            position: new Animated.Value(mainWidth / 3),
            posValue: mainWidth / 3,
            duration: 150,
            mainWidth: width - 30,
            loadingPropsByFirstTime: false,
            loadedLayout: false
        };

        setTimeout(() => {
            if(this.props.isLayoutReady){
                this.props.isLayoutReady();
            }
        }, 1000);
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.options) {
            let options = [];
            for(var idx in nextProps.options) {
                options.push(nextProps.options[idx].label)
            }
            this.setState({ options : options });

            if(!this.state.loadingPropsByFirstTime) {
                //Update layout variables
                this.setState({
                    position: new Animated.Value(mainWidth / (options.length - 1)),
                    posValue: mainWidth / (options.length - 1),
                    loadingPropsByFirstTime: true
                });
                Animated.parallel([
                    Animated.timing(this.state.widthSelected, {
                        toValue: (mainWidth / (options.length - 1)) * 1,
                        duration: 750
                    }),
                    Animated.timing(this.state.widthUnselected, {
                        toValue: (mainWidth / (options.length - 1)) * 3,
                        duration: 750
                    })
                ]).start();

                this.setState({ loadedLayout : true })
            }
        }
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,

            onPanResponderGrant: () => {
                // disable parent scroll if slider is inside a scrollview
                if (!this.isParentScrollDisabled) {
                    this.props.disableScroll(false);
                    this.isParentScrollDisabled = true;
                }
            },

            onPanResponderMove: (evt, gestureState) => {
                let finalValue = gestureState.dx + this.state.posValue;
                if (
                    finalValue >= 0 &&
                    finalValue <= (mainWidth - 10)
                )
                    this.state.position.setValue(
                        this.state.posValue + gestureState.dx
                    );
            },

            onPanResponderTerminationRequest: () => true,

            onPanResponderRelease: (evt, gestureState) => {
                let finalValue = gestureState.dx + this.state.posValue;
                let newSelectedOption = -1;
                this.isParentScrollDisabled = false;
                this.props.disableScroll(true);

                let breakPointsQty = (this.state.options.length - 1);
                let breakPointWidth = mainWidth / breakPointsQty;

                if(finalValue >= mainWidth){
                    this.animateProgress(mainWidth)
                }

                if(gestureState.dx > 0) {
                    for(var idx in this.state.options) {
                        const multiplier = idx;
                        const currentXCoord = breakPointWidth * parseInt(multiplier);
                        const nextXCoord = breakPointWidth * (parseInt(multiplier) + 1);

                        if(finalValue > currentXCoord && finalValue > (nextXCoord - 100)) {
                            this.animateProgress(nextXCoord);
                            newSelectedOption = parseInt(multiplier) + 1;
                        } else if(finalValue > currentXCoord && finalValue < nextXCoord) {
                            this.animateProgress(nextXCoord);
                            newSelectedOption = parseInt(multiplier);
                        }
                    }
                } else {
                    for(var idx in this.state.options) {
                        const multiplier = idx;
                        const currentXCoord = breakPointWidth * parseInt(multiplier);
                        const nextXCoord = breakPointWidth * (parseInt(multiplier) + 1);

                        if(finalValue > currentXCoord && finalValue < nextXCoord) {
                            const diffNextXCoord = nextXCoord - finalValue;
                            const diffCurrentXCoord = finalValue - currentXCoord;

                            if(diffNextXCoord > diffCurrentXCoord) {
                                this.animateProgress(currentXCoord);
                                newSelectedOption = parseInt(multiplier);
                            } else {
                                this.animateProgress(nextXCoord);
                                newSelectedOption = parseInt(multiplier) + 1;
                            }
                        } else {
                            if(finalValue <= 0) {
                                this.animateProgress(0);
                                newSelectedOption = 0;
                            }
                        }
                    }
                }

                if(newSelectedOption != -1 && this.props.onChangeSelectedOption) {
                    this.props.onChangeSelectedOption(newSelectedOption);
                }
            },

            onPanResponderTerminate: () => {},
            onShouldBlockNativeResponder: () => {
                // Returns whether this component should block native components from becoming the JS
                // responder. Returns true by default. Is currently only supported on android.
                return true;
            }
        });
    }

    animateProgress = (coordinateX) => {
        if(coordinateX > (mainWidth - 0)) {
            coordinateX = mainWidth;
        }

        Animated.parallel([
            Animated.timing(this.state.widthSelected, {
                toValue: coordinateX,
                duration: 250
            }),
            Animated.timing(this.state.widthUnselected, {
                toValue: mainWidth - coordinateX,
                duration: 250
            }),
            Animated.timing(this.state.position, {
                toValue: coordinateX,
                duration: this.state.duration,
            })
        ]).start(() => {
            this.setState({
                posValue: coordinateX
            });
        });
    }

    render() {
        if(!this.state.loadedLayout)
            return ( <ActivityIndicator /> );

        return (
            <View style={styles.container}>
                <View style={styles.containerBars}>
                    <View style={styles.progressBar}>
                        <Animated.View style={{backgroundColor: '#009dff', width: this.state.widthSelected, height: 10}}></Animated.View>
                        <Animated.View style={{backgroundColor: '#e8e9ea', width: this.state.widthUnselected, height: 10}}></Animated.View>
                    </View>
                    { this.renderBreakPoints() }
                    <Animated.View
                        {...this._panResponder.panHandlers}
                        style={[styles.switcher, { transform: [{ translateX: this.state.position }] }]}>
                        <View style={styles.switcherInner} onStartShouldSetResponderCapture={() => { return false; }}></View>
                    </Animated.View>
                </View>
                { this.renderLabels() }
            </View>
        );
    }

    renderLabels() {
        let texts = [];
        for(var idx in this.state.options) {
            const leftX = (idx > 0 ? ((mainWidth / (this.state.options.length - 1)) * idx) : 0);
            //const leftX = ((mainWidth / this.state.options.length) * (parseInt(idx) + 1));
            texts.push(
                <Text style={{
                    position: 'absolute',
                    left: leftX,
                    width: (mainWidth / this.state.options.length),
                    fontFamily: Font.NunitoRegular,
                    fontSize: 14,
                    color: '#7f7f7f'
                }}>{this.state.options[idx]}</Text>
            );
        }

        return (
            <View style={styles.containerLabels}>
                { texts }
            </View>
        );
    }

    renderBreakPoints() {
        let breakpoints = [];
        for(var idx in this.state.options) {
            const leftX = (idx > 0 ? ((mainWidth / (this.state.options.length - 1)) * idx) : 0);
            //const leftX = ((mainWidth / this.state.options.length) * (parseInt(idx) + 1));
            breakpoints.push(
                <View style={{ width: 9, height: 9, backgroundColor: '#009dff', position: 'absolute', top: 3, left: leftX, borderRadius: 5 }}></View>
            );
        }

        return (
            <View style={{ width: '100%', backgroundColor: 'transparent', height: 15, position: 'absolute' }}>
                { breakpoints }
            </View>
        );
    }
}

MultiSlider.propTypes = {
    disableScroll: PropTypes.func,
    onStatusChanged: PropTypes.func
};

const Colors = {
    mBackColor: '#efefef',
    mBorderColor: '#efefef',
    white: '#FFFFFF',
    shadowColor: '#A69E9E'
};

const Metrics = {
    containerWidth: width - 30,
    switchWidth: width / 2.7
};

const styles = StyleSheet.create({
    containerBars: {
        width: '100%',
        height: 40,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center'
    },
    containerLabels: {
        marginTop: 10,
        flexDirection: 'row',
        height: 30,
        width: '100%'
    },
    progressBar: {
        flexDirection: 'row',
        height: 2,
        width: '100%',
        alignSelf: 'center',
        borderRadius: 10,
    },
    switcher: {
        flexDirection: 'row',
        position: 'absolute',
        top: 0,
        left: 0,
        padding: 40,
        //backgroundColor: 'red',
        //borderRadius: 7,
        //height: 14,
        //width: 14,
        width: 30,
        height: 30,
        //padding: 0,
    },
    switcherInner: {
        flexDirection: 'row',
        position: 'absolute',
        top: 10,
        left: 0,
        padding: 1,
        backgroundColor: '#009dff',
        borderRadius: 10,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: 20,
        elevation: 2,
        shadowOpacity: 0.31,
        shadowRadius: 10,
        shadowColor: Colors.shadowColor
    },
    buttonStyle: {
        flex: 1,
        width: Metrics.containerWidth / 3,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center'
    }
});