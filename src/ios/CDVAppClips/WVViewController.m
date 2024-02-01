//
//  WVViewController.m
//  CDVAppClips
//
//  Created by Andre Grillo on 01/02/2024.
//

#import <UIKit/UIKit.h>
#import <WebKit/WebKit.h>

@interface WVViewController : UIViewController

@property (strong, nonatomic) WKWebView *webView;

@end

@implementation WVViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    // Initialize and set up the web view
    self.webView = [[WKWebView alloc] initWithFrame:self.view.bounds];
    self.webView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    [self.view addSubview:self.webView];
    
    // Configure web view settings
    [self setupWebView];
    
    // Load the URL
    NSURL *url = [NSURL URLWithString:@"--PLACEHOLDER--"];
    NSURLRequest *request = [NSURLRequest requestWithURL:url];
    [self.webView loadRequest:request];
}

- (void)setupWebView {
    // Adjust content insets to remove white space at the top
    CGFloat statusBarHeight = [[UIApplication sharedApplication] statusBarFrame].size.height;
    self.webView.scrollView.contentInset = UIEdgeInsetsMake(-statusBarHeight, 0, 0, 0);
    self.webView.scrollView.scrollIndicatorInsets = UIEdgeInsetsMake(-statusBarHeight, 0, 0, 0);

    // Disable bouncing
    self.webView.scrollView.bounces = NO;
}

@end
