const fs = require('fs');
const path = require('path');

// Swift files to include in the project
const swiftFiles = [
    'ProxyConfig.swift',
    'SearchView.swift',
    'TestRegisterView.swift',
    'MoreView.swift',
    'IBDNutritionAnalyzer.swift',
    'FoodNLPProcessor.swift',
    'FlarePredictionTest.swift',
    'LoginView.swift',
    'EnhancedFoodDatabase.swift',
    'FoodDatabase.swift',
    'IBDColors.swift',
    'MyDiagnosisView.swift',
    'NetworkManager.swift',
    'IBDPalApp.swift',
    'HomeView.swift',
    'AdvancedFoodNLPProcessor.swift',
    'CompoundFoodDatabase.swift',
    'FlarePredictionView.swift',
    'DiscoverView.swift',
    'FlarePredictionML.swift',
    'IBDNutritionAnalysisView.swift',
    'BlogView.swift',
    'NetworkTestView.swift',
    'EnhancedNutritionCalculator.swift',
    'AdvancedFoodNLPDemo.swift',
    'FoodNLPDemo.swift',
    'RegisterView.swift',
    'NetworkLogger.swift',
    'DailyLogView.swift',
    'ContentView.swift',
    'SSLBypassProtocol.swift',
    'LogViewerView.swift',
    'AppConfig.swift'
];

// Generate unique IDs for Xcode project
function generateID() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Create file references
function createFileReferences() {
    let references = '';
    let buildFiles = '';
    let fileRefs = '';
    
    swiftFiles.forEach((file, index) => {
        const fileID = generateID();
        const buildFileID = generateID();
        
        fileRefs += `\t\t${fileID} /* ${file} */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = ${file}; sourceTree = "<group>"; };\n`;
        buildFiles += `\t\t${buildFileID} /* ${file} in Sources */ = {isa = PBXBuildFile; fileRef = ${fileID} /* ${file} */; };\n`;
        references += `\t\t\t\t${fileID} /* ${file} */,\n`;
    });
    
    return { fileRefs, buildFiles, references };
}

// Generate the project file content
function generateProjectFile() {
    const { fileRefs, buildFiles, references } = createFileReferences();
    
    return `// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 56;
	objects = {

/* Begin PBXBuildFile section */
${buildFiles}/* End PBXBuildFile section */

/* Begin PBXFileReference section */
		7E0986A72E2C612900B96357 /* IBDPal.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = IBDPal.app; sourceTree = BUILT_PRODUCTS_DIR; };
		7E0986B42E2C612D00B96357 /* IBDPalTests.xctest */ = {isa = PBXFileReference; explicitFileType = wrapper.cfbundle; includeInIndex = 0; path = IBDPalTests.xctest; sourceTree = BUILT_PRODUCTS_DIR; };
		7E0986BE2E2C612D00B96357 /* IBDPalUITests.xctest */ = {isa = PBXFileReference; explicitFileType = wrapper.cfbundle; includeInIndex = 0; path = IBDPalUITests.xctest; sourceTree = BUILT_PRODUCTS_DIR; };
${fileRefs}/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
		7E0986A42E2C612900B96357 /* Frameworks */ = {
			isa = PBXFrameworksBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
		7E0986B12E2C612D00B96357 /* Frameworks */ = {
			isa = PBXFrameworksBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
		7E0986BB2E2C612D00B96357 /* Frameworks */ = {
			isa = PBXFrameworksBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
		7E09869E2E2C612900B96357 = {
			isa = PBXGroup;
			children = (
				7E0986A92E2C612900B96357 /* IBDPal */,
				7E0986B72E2C612D00B96357 /* IBDPalTests */,
				7E0986C12E2C612D00B96357 /* IBDPalUITests */,
				7E0986A82E2C612900B96357 /* Products */,
			);
			sourceTree = "<group>";
		};
		7E0986A82E2C612900B96357 /* Products */ = {
			isa = PBXGroup;
			children = (
				7E0986A72E2C612900B96357 /* IBDPal.app */,
				7E0986B42E2C612D00B96357 /* IBDPalTests.xctest */,
				7E0986BE2E2C612D00B96357 /* IBDPalUITests.xctest */,
			);
			name = Products;
			sourceTree = "<group>";
		};
		7E0986A92E2C612900B96357 /* IBDPal */ = {
			isa = PBXGroup;
			children = (
${references}			);
			path = IBDPal;
			sourceTree = "<group>";
		};
		7E0986B72E2C612D00B96357 /* IBDPalTests */ = {
			isa = PBXGroup;
			path = IBDPalTests;
			sourceTree = "<group>";
		};
		7E0986C12E2C612D00B96357 /* IBDPalUITests */ = {
			isa = PBXGroup;
			path = IBDPalUITests;
			sourceTree = "<group>";
		};
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
		7E0986A62E2C612900B96357 /* IBDPal */ = {
			isa = PBXNativeTarget;
			buildConfigurationList = 7E0986C22E2C612D00B96357 /* Build configuration list for PBXNativeTarget "IBDPal" */;
			buildPhases = (
				7E0986A32E2C612900B96357 /* Sources */,
				7E0986A42E2C612900B96357 /* Frameworks */,
				7E0986A52E2C612900B96357 /* Resources */,
			);
			buildRules = (
			);
			dependencies = (
			);
			name = IBDPal;
			productName = IBDPal;
			productReference = 7E0986A72E2C612900B96357 /* IBDPal.app */;
			productType = "com.apple.product-type.application";
		};
		7E0986B32E2C612D00B96357 /* IBDPalTests */ = {
			isa = PBXNativeTarget;
			buildConfigurationList = 7E0986B82E2C612D00B96357 /* Build configuration list for PBXNativeTarget "IBDPalTests" */;
			buildPhases = (
				7E0986B02E2C612D00B96357 /* Sources */,
				7E0986B12E2C612D00B96357 /* Frameworks */,
				7E0986B22E2C612D00B96357 /* Resources */,
			);
			buildRules = (
			);
			dependencies = (
				7E0986B62E2C612D00B96357 /* PBXTargetDependency */,
			);
			name = IBDPalTests;
			productName = IBDPalTests;
			productReference = 7E0986B42E2C612D00B96357 /* IBDPalTests.xctest */;
			productType = "com.apple.product-type.bundle.unit-test";
		};
		7E0986BD2E2C612D00B96357 /* IBDPalUITests */ = {
			isa = PBXNativeTarget;
			buildConfigurationList = 7E0986C32E2C612D00B96357 /* Build configuration list for PBXNativeTarget "IBDPalUITests" */;
			buildPhases = (
				7E0986BA2E2C612D00B96357 /* Sources */,
				7E0986BB2E2C612D00B96357 /* Frameworks */,
				7E0986BC2E2C612D00B96357 /* Resources */,
			);
			buildRules = (
			);
			dependencies = (
				7E0986C02E2C612D00B96357 /* PBXTargetDependency */,
			);
			name = IBDPalUITests;
			productName = IBDPalUITests;
			productReference = 7E0986BE2E2C612D00B96357 /* IBDPalUITests.xctest */;
			productType = "com.apple.product-type.bundle.ui-testing";
		};
/* End PBXNativeTarget section */

/* Begin PBXProject section */
		7E09869F2E2C612900B96357 /* Project object */ = {
			isa = PBXProject;
			attributes = {
				BuildIndependentTargetsInParallel = 1;
				LastSwiftUpdateCheck = 1600;
				LastUpgradeCheck = 1600;
				TargetAttributes = {
					7E0986A62E2C612900B96357 = {
						CreatedOnToolsVersion = 16.0;
					};
					7E0986B32E2C612D00B96357 = {
						CreatedOnToolsVersion = 16.0;
						TestTargetID = 7E0986A62E2C612900B96357;
					};
					7E0986BD2E2C612D00B96357 = {
						CreatedOnToolsVersion = 16.0;
						TestTargetID = 7E0986A62E2C612900B96357;
					};
				};
			};
			buildConfigurationList = 7E0986A22E2C612900B96357 /* Build configuration list for PBXProject "IBDPal" */;
			developmentRegion = en;
			hasScannedForEncodings = 0;
			knownRegions = (
				en,
				Base,
			);
			mainGroup = 7E09869E2E2C612900B96357;
			productRefGroup = 7E0986A82E2C612900B96357 /* Products */;
			projectDirPath = "";
			projectRoot = "";
			targets = (
				7E0986A62E2C612900B96357 /* IBDPal */,
				7E0986B32E2C612D00B96357 /* IBDPalTests */,
				7E0986BD2E2C612D00B96357 /* IBDPalUITests */,
			);
		};
/* End PBXProject section */

/* Begin PBXResourcesBuildPhase section */
		7E0986A52E2C612900B96357 /* Resources */ = {
			isa = PBXResourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
		7E0986B22E2C612D00B96357 /* Resources */ = {
			isa = PBXResourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
		7E0986BC2E2C612D00B96357 /* Resources */ = {
			isa = PBXResourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXResourcesBuildPhase section */

/* Begin PBXSourcesBuildPhase section */
		7E0986A32E2C612900B96357 /* Sources */ = {
			isa = PBXSourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
${buildFiles}			);
			runOnlyForDeploymentPostprocessing = 0;
		};
		7E0986B02E2C612D00B96357 /* Sources */ = {
			isa = PBXSourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
		7E0986BA2E2C612D00B96357 /* Sources */ = {
			isa = PBXSourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXSourcesBuildPhase section */

/* Begin PBXTargetDependency section */
		7E0986B62E2C612D00B96357 /* PBXTargetDependency */ = {
			isa = PBXTargetDependency;
			target = 7E0986A62E2C612900B96357 /* IBDPal */;
			targetProxy = 7E0986B52E2C612D00B96357 /* PBXContainerItemProxy */;
		};
		7E0986C02E2C612D00B96357 /* PBXTargetDependency */ = {
			isa = PBXTargetDependency;
			target = 7E0986A62E2C612900B96357 /* IBDPal */;
			targetProxy = 7E0986BF2E2C612D00B96357 /* PBXContainerItemProxy */;
		};
/* End PBXTargetDependency section */

/* Begin XCBuildConfiguration section */
		7E0986C62E2C612D00B96357 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS = YES;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION = YES_AGGRESSIVE;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				CLANG_ENABLE_OBJC_WEAK = YES;
				CLANG_WARN_BLOCK_CAPTURE_AUTORELEASING = YES;
				CLANG_WARN_BOOL_CONVERSION = YES;
				CLANG_WARN_COMMA = YES;
				CLANG_WARN_CONSTANT_CONVERSION = YES;
				CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS = YES;
				CLANG_WARN_DIRECT_OBJC_ISA_USAGE = YES_ERROR;
				CLANG_WARN_DOCUMENTATION_COMMENTS = YES;
				CLANG_WARN_EMPTY_BODY = YES;
				CLANG_WARN_ENUM_CONVERSION = YES;
				CLANG_WARN_INFINITE_RECURSION = YES;
				CLANG_WARN_INT_CONVERSION = YES;
				CLANG_WARN_NON_LITERAL_NULL_CONVERSION = YES;
				CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF = YES;
				CLANG_WARN_OBJC_LITERAL_CONVERSION = YES;
				CLANG_WARN_OBJC_ROOT_CLASS = YES_ERROR;
				CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = YES;
				CLANG_WARN_RANGE_LOOP_ANALYSIS = YES;
				CLANG_WARN_STRICT_PROTOTYPES = YES;
				CLANG_WARN_SUSPICIOUS_MOVE = YES;
				CLANG_WARN_UNGUARDED_AVAILABILITY = YES_AGGRESSIVE;
				CLANG_WARN_UNREACHABLE_CODE = YES;
				CLANG_WARN__DUPLICATE_METHOD_MATCH = YES;
				COPY_PHASE_STRIP = NO;
				DEBUG_INFORMATION_FORMAT = dwarf;
				DEVELOPMENT_TEAM = 68A7DR48MC;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				ENABLE_TESTABILITY = YES;
				ENABLE_USER_SCRIPT_SANDBOXING = YES;
				GCC_C_LANGUAGE_STANDARD = gnu17;
				GCC_DYNAMIC_NO_PIC = NO;
				GCC_NO_COMMON_BLOCKS = YES;
				GCC_OPTIMIZATION_LEVEL = 0;
				GCC_PREPROCESSOR_DEFINITIONS = (
					"DEBUG=1",
					"$(inherited)",
				);
				GCC_WARN_64_TO_32_BIT_CONVERSION = YES;
				GCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;
				GCC_WARN_UNDECLARED_SELECTOR = YES;
				GCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;
				GCC_WARN_UNUSED_FUNCTION = YES;
				GCC_WARN_UNUSED_VARIABLE = YES;
				IPHONEOS_DEPLOYMENT_TARGET = 17.0;
				LOCALIZATION_PREFERS_STRING_CATALOGS = YES;
				MTL_ENABLE_DEBUG_INFO = INCLUDE_SOURCE;
				MTL_FAST_MATH = YES;
				ONLY_ACTIVE_ARCH = YES;
				SDKROOT = iphoneos;
				SWIFT_ACTIVE_COMPILATION_CONDITIONS = DEBUG;
				SWIFT_OPTIMIZATION_LEVEL = "-Onone";
			};
			name = Debug;
		};
		7E0986C72E2C612D00B96357 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS = YES;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION = YES_AGGRESSIVE;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				CLANG_ENABLE_OBJC_WEAK = YES;
				CLANG_WARN_BLOCK_CAPTURE_AUTORELEASING = YES;
				CLANG_WARN_BOOL_CONVERSION = YES;
				CLANG_WARN_COMMA = YES;
				CLANG_WARN_CONSTANT_CONVERSION = YES;
				CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS = YES;
				CLANG_WARN_DIRECT_OBJC_ISA_USAGE = YES_ERROR;
				CLANG_WARN_DOCUMENTATION_COMMENTS = YES;
				CLANG_WARN_EMPTY_BODY = YES;
				CLANG_WARN_ENUM_CONVERSION = YES;
				CLANG_WARN_INFINITE_RECURSION = YES;
				CLANG_WARN_INT_CONVERSION = YES;
				CLANG_WARN_NON_LITERAL_NULL_CONVERSION = YES;
				CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF = YES;
				CLANG_WARN_OBJC_LITERAL_CONVERSION = YES;
				CLANG_WARN_OBJC_ROOT_CLASS = YES_ERROR;
				CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = YES;
				CLANG_WARN_RANGE_LOOP_ANALYSIS = YES;
				CLANG_WARN_STRICT_PROTOTYPES = YES;
				CLANG_WARN_SUSPICIOUS_MOVE = YES;
				CLANG_WARN_UNGUARDED_AVAILABILITY = YES_AGGRESSIVE;
				CLANG_WARN_UNREACHABLE_CODE = YES;
				CLANG_WARN__DUPLICATE_METHOD_MATCH = YES;
				COPY_PHASE_STRIP = NO;
				DEBUG_INFORMATION_FORMAT = "dwarf-with-dsym";
				DEVELOPMENT_TEAM = 68A7DR48MC;
				ENABLE_NS_ASSERTIONS = NO;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				ENABLE_USER_SCRIPT_SANDBOXING = YES;
				GCC_C_LANGUAGE_STANDARD = gnu17;
				GCC_NO_COMMON_BLOCKS = YES;
				GCC_WARN_64_TO_32_BIT_CONVERSION = YES;
				GCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;
				GCC_WARN_UNDECLARED_SELECTOR = YES;
				GCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;
				GCC_WARN_UNUSED_FUNCTION = YES;
				GCC_WARN_UNUSED_VARIABLE = YES;
				IPHONEOS_DEPLOYMENT_TARGET = 17.0;
				LOCALIZATION_PREFERS_STRING_CATALOGS = YES;
				MTL_ENABLE_DEBUG_INFO = NO;
				MTL_FAST_MATH = YES;
				SDKROOT = iphoneos;
				SWIFT_COMPILATION_MODE = wholemodule;
				SWIFT_OPTIMIZATION_LEVEL = "-O";
				VALIDATE_PRODUCT = YES;
			};
			name = Release;
		};
		7E0986C92E2C612D00B96357 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				DEVELOPMENT_TEAM = 68A7DR48MC;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_KEY_UIApplicationSceneManifest_Generation = YES;
				INFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents = YES;
				INFOPLIST_KEY_UILaunchScreen_Generation = YES;
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad = "UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone = "UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
				);
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.ibdpal.app;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Debug;
		};
		7E0986CA2E2C612D00B96357 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				DEVELOPMENT_TEAM = 68A7DR48MC;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_KEY_UIApplicationSceneManifest_Generation = YES;
				INFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents = YES;
				INFOPLIST_KEY_UILaunchScreen_Generation = YES;
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad = "UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone = "UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
				);
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.ibdpal.app;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Release;
		};
		7E0986CC2E2C612D00B96357 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				BUNDLE_LOADER = "$(TEST_HOST)";
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				DEVELOPMENT_TEAM = 68A7DR48MC;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_KEY_UIApplicationSceneManifest_Generation = YES;
				INFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents = YES;
				INFOPLIST_KEY_UILaunchScreen_Generation = YES;
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad = "UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone = "UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
				);
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.ibdpal.appTests;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
				TEST_HOST = "$(BUILT_PRODUCTS_DIR)/IBDPal.app/IBDPal";
			};
			name = Debug;
		};
		7E0986CD2E2C612D00B96357 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				BUNDLE_LOADER = "$(TEST_HOST)";
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				DEVELOPMENT_TEAM = 68A7DR48MC;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_KEY_UIApplicationSceneManifest_Generation = YES;
				INFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents = YES;
				INFOPLIST_KEY_UILaunchScreen_Generation = YES;
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad = "UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone = "UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
				);
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.ibdpal.appUITests;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
				TEST_HOST = "$(BUILT_PRODUCTS_DIR)/IBDPal.app/IBDPal";
			};
			name = Release;
		};
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
		7E0986A22E2C612900B96357 /* Build configuration list for PBXProject "IBDPal" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				7E0986C62E2C612D00B96357 /* Debug */,
				7E0986C72E2C612D00B96357 /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
		7E0986C22E2C612D00B96357 /* Build configuration list for PBXNativeTarget "IBDPal" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				7E0986C92E2C612D00B96357 /* Debug */,
				7E0986CA2E2C612D00B96357 /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
		7E0986B82E2C612D00B96357 /* Build configuration list for PBXNativeTarget "IBDPalTests" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				7E0986CC2E2C612D00B96357 /* Debug */,
				7E0986CD2E2C612D00B96357 /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
		7E0986C32E2C612D00B96357 /* Build configuration list for PBXNativeTarget "IBDPalUITests" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				7E0986CC2E2C612D00B96357 /* Debug */,
				7E0986CD2E2C612D00B96357 /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
/* End XCConfigurationList section */
	};
	rootObject = 7E09869F2E2C612900B96357 /* Project object */;
}`;
}

// Write the new project file
const projectContent = generateProjectFile();
const projectPath = path.join(__dirname, '../IBDPal/IBDPal.xcodeproj/project.pbxproj');

fs.writeFileSync(projectPath, projectContent);
console.log('✅ Xcode project file has been fixed!');
console.log('📁 Project file updated at:', projectPath);
console.log('🔧 Added', swiftFiles.length, 'Swift files to the project');
console.log('🚀 You can now try building the project in Xcode'); 