package com.example.calavera

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

class MainActivity : ComponentActivity() {
  private var webView: WebView? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent {
      AndroidView(
        factory = { context ->
          WebView(context).apply {
            webView = this
            webViewClient = WebViewClient()
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = true
            settings.allowContentAccess = true
            settings.builtInZoomControls = false
            settings.displayZoomControls = false
            loadUrl("file:///android_asset/www/index.html")
          }
        },
        modifier = Modifier.fillMaxSize()
      )
    }
  }

  @Suppress("DEPRECATION")
  override fun onBackPressed() {
    val tempWebView = webView
    if (tempWebView != null && tempWebView.canGoBack()) {
      tempWebView.goBack()
    } else {
      super.onBackPressed()
    }
  }
}
