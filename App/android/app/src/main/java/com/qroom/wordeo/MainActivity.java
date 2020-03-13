package com.qroom.wordeo;

import com.reactnativenavigation.controllers.SplashActivity;
import com.facebook.react.modules.core.PermissionListener; // <- add this import
import android.os.Bundle;
import io.fabric.sdk.android.Fabric;
import com.crashlytics.android.Crashlytics;
import android.content.Intent;
import android.content.res.Configuration;
import android.widget.LinearLayout;

import android.graphics.Color;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.view.Gravity;
import android.util.TypedValue;
import android.widget.ProgressBar;
import android.widget.ImageView;

public class MainActivity extends SplashActivity {
	private PermissionListener listener; // <- add this attribute

	@Override
	public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults)
	{
		super.onRequestPermissionsResult(requestCode, permissions, grantResults);
	}

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
    }

	@Override
	protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    	Fabric.with(this, new Crashlytics());
	}

    @Override
    public LinearLayout createSplashLayout() {
        LinearLayout containerSplash = new LinearLayout(this);
        containerSplash.setId(R.id.containerSplash);
        LinearLayout.LayoutParams layout_458 = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT);
        containerSplash.setLayoutParams(layout_458);

        RelativeLayout relativeLayout_330 = new RelativeLayout(this);
        RelativeLayout.LayoutParams layout_158 = new RelativeLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT);
        relativeLayout_330.setLayoutParams(layout_158);

        ImageView imageView = new ImageView(this);
        imageView.setId(R.id.imageView);
        imageView.setImageResource(R.drawable.splash);
        RelativeLayout.LayoutParams layout_236 = new RelativeLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT);
        imageView.setLayoutParams(layout_236);
        relativeLayout_330.addView(imageView);

        containerSplash.addView(relativeLayout_330);

        return containerSplash;
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        this.sendBroadcast(intent);
    }
}
