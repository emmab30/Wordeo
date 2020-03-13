package com.qroom.wordeo;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.view.WindowManager;
import android.support.multidex.MultiDex;
import android.content.Context;

import com.facebook.react.ReactPackage;
import com.geektime.rnonesignalandroid.ReactNativeOneSignalPackage;
import com.reactnativenavigation.NavigationApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.BV.LinearGradient.LinearGradientPackage;
import com.reactnativenavigation.controllers.ActivityCallbacks;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.react.rnspinkit.RNSpinkitPackage;
import com.rnfs.RNFSPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.smixx.fabric.FabricPackage;
import cl.json.RNSharePackage;
import cl.json.ShareApplication;
import com.github.yamill.orientation.OrientationPackage;
import com.zmxv.RNSound.RNSoundPackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage;

import com.facebook.CallbackManager;
import com.facebook.FacebookSdk;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.facebook.appevents.AppEventsLogger;
import io.realm.react.RealmReactPackage;
import com.wix.interactable.Interactable;

import java.util.List;
import java.util.Arrays;

public class MainApplication extends NavigationApplication {
    private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

    protected static CallbackManager getCallbackManager() {
        return mCallbackManager;
    }

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
		@Override
		public boolean getUseDeveloperSupport() {
			return BuildConfig.DEBUG;
		}

		@Override
		protected List<ReactPackage> getPackages() {
			return Arrays.<ReactPackage>asList(
				new MainReactPackage()
			);
		}
	};

	@Override
	public void onCreate() {
		super.onCreate();
		setActivityCallbacks(new ActivityCallbacks() {
			@Override
			public void onActivityCreated(Activity activity, Bundle savedInstanceState) {
				activity.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
			}

			@Override
			public void onActivityStarted(Activity activity) {

			}

			@Override
			public void onActivityResumed(Activity activity) {

			}

			@Override
			public void onActivityPaused(Activity activity) {

			}

			@Override
			public void onActivityStopped(Activity activity) {

			}

			@Override
			public void onActivityResult(int requestCode, int resultCode, Intent data) {
                super.onActivityResult(requestCode, resultCode, data);
                MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
			}

			@Override
			public void onActivityDestroyed(Activity activity) {

			}
		});

        FacebookSdk.sdkInitialize(getApplicationContext());
        // If you want to use AppEventsLogger to log events.
        AppEventsLogger.activateApp(this);
	}

    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
        MultiDex.install(this);
    }

	@Override
	public boolean isDebug() {
		return BuildConfig.DEBUG;
	}

	@Nullable
	@Override
	public List<ReactPackage> createAdditionalReactPackages() {
		return Arrays.<ReactPackage>asList(
			new LinearGradientPackage(),
			new ReactNativeOneSignalPackage(),
			new RNFetchBlobPackage(),
			new RNSpinkitPackage(),
			new RNFSPackage(),
			new ReactNativeConfigPackage(),
			new RNDeviceInfo(),
			new ReactNativeLocalizationPackage(),
			new RNI18nPackage(),
			new FabricPackage(),
			new OrientationPackage(),
            new FBSDKPackage(mCallbackManager),
            new RNSoundPackage(),
            new RNFirebasePackage(),
            new RNFirebaseAnalyticsPackage(),
            new RealmReactPackage(),
            new Interactable()
		);
	}
}
