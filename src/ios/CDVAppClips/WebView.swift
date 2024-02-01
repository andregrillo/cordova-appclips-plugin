//
//  Webview.swift
//  AppClip
//
//  Created by Andre Grillo on 22/01/2024.
//

import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    var url: URL

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()

        // Adjust content insets to remove white space at the top
        webView.scrollView.contentInset = UIEdgeInsets(top: -UIApplication.shared.statusBarFrame.height, left: 0, bottom: 0, right: 0)
        webView.scrollView.scrollIndicatorInsets = UIEdgeInsets(top: -UIApplication.shared.statusBarFrame.height, left: 0, bottom: 0, right: 0)
        
        // Disable bouncing
        webView.scrollView.bounces = false
        
        webView.scrollView.isScrollEnabled = true // Enable scrolling in WebView
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        uiView.load(request)
    }
}
