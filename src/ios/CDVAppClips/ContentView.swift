//
//  ContentView.swift
//  AppClip
//
//  Created by Andre Grillo on 18/01/2024.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        WebView(url: URL(string: "--PLACEHOLDER--")!)
            .edgesIgnoringSafeArea(.all)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
