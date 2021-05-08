package org.lycheejs.runtime;

import android.app.Activity;
import android.net.ConnectivityManager;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;


/**
 * The lychee.js runtime for now uses a simple WebView wrapper
 */
public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);


        this.requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        setContentView(R.layout.activity_main);


        WebView webview = (WebView) findViewById(R.id.webview);
        WebSettings websettings = webview.getSettings();

        websettings.setJavaScriptEnabled(true);
        websettings.setAppCacheEnabled(true);
        websettings.setAppCachePath(getApplicationContext().getCacheDir().getAbsolutePath());
        websettings.setAllowFileAccess(true);
        websettings.setAllowFileAccessFromFileURLs(true);

        ConnectivityManager cm = (ConnectivityManager) this.getSystemService(Activity.CONNECTIVITY_SERVICE);
        if (cm.getActiveNetworkInfo() == null || cm.getActiveNetworkInfo().isConnected() == false) {
            websettings.setCacheMode(WebSettings.LOAD_CACHE_ONLY);
        } else {
            websettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
        }


        webview.setClickable(true);
        webview.setLongClickable(false);
        webview.loadUrl("file:///android_asset/index.html");
        webview.setWebViewClient(new android.webkit.WebViewClient());

    }

    @Override
    protected void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);
    }

}
