"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVirtualDeviceNameForPlatform = exports.getNativeIDEForPlatform = exports.generateOptionsForCapacitorBuild = void 0;
function generateOptionsForCapacitorBuild(inputs, options) {
    const [platform] = inputs;
    return {
        ...options,
        externalAddressRequired: true,
        open: false,
        engine: 'capacitor',
        platform: platform ? platform : (options['platform'] ? String(options['platform']) : undefined),
    };
}
exports.generateOptionsForCapacitorBuild = generateOptionsForCapacitorBuild;
function getNativeIDEForPlatform(platform) {
    switch (platform) {
        case 'ios':
            return 'Xcode';
        case 'android':
            return 'Android Studio';
    }
    return 'Native IDE';
}
exports.getNativeIDEForPlatform = getNativeIDEForPlatform;
function getVirtualDeviceNameForPlatform(platform) {
    switch (platform) {
        case 'ios':
            return 'simulator';
        case 'android':
            return 'emulator';
    }
    return 'virtual device';
}
exports.getVirtualDeviceNameForPlatform = getVirtualDeviceNameForPlatform;
