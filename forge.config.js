const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

const fse = require('fs-extra');
const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
	
	"ignore": [
		"^/game_data",
		"^/game_data_TS",
	]
  },
  hooks: {
	  postPackage: async(forgeConfig, options) => {
		console.warn("postPackage hook");  
		console.warn(forgeConfig);  
		console.warn("==options=="); 
		console.warn(options);  
	  
	  
		  for(const outputPath of options.outputPaths){
				const resources = [
				{
				  from: './DSCSTools',
				  to: path.join(outputPath, "resources", 'DSCSTools')
				},
				{
				  from: './game_data_TS/unpacked/digi_data.json',
				  to: path.join(outputPath, "resources", 'game_data_TS/unpacked/digi_data.json')
				},
				{
				  from: './game_data_TS/unpacked/images/converted',
				  to: path.join(outputPath, "resources", 'game_data_TS/unpacked/images/converted')
				},
				{
				  from: './DSTSTools',
				  to: path.join(outputPath, "resources", 'DSTSTools')
				},
				{
				  from: './node_modules/@imagemagick/magick-wasm/dist/magick.wasm',
				  to: path.join(outputPath, "resources", 'node_modules/@imagemagick/magick-wasm/dist/magick.wasm')
				}
			  ];

			  for (const resource of resources) {
				try {
				  await fse.copy(resource.from, resource.to, {
					overwrite: true,
				  });
				  console.log(`✓ Copied: ${resource.from}`);
				} catch (error) {
				  console.error(`✗ Failed to copy ${resource.from}:`, error.message);
				}
			  }	
		  }
	  }
  },
  

  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
