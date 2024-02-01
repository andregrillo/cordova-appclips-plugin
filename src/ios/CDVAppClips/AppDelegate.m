//
//  AppDelegate.m
//  CDVAppClips
//
//  Created by Andre Grillo on 01/02/2024.
//

#import "AppDelegate.h"
#import "WVViewController.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    WVViewController *viewController = [[WVViewController alloc] init];
    self.window.rootViewController = viewController;
    [self.window makeKeyAndVisible];
    return YES;
}

@end

