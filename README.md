# <img src="https://raw.githubusercontent.com/jonathonwolfe/chance-the-gardener/master/img/Chance-the-Gardener_logo_icon.png" width="40" height="40"> Chance the Gardener
Chance the Gardener is an application that lets you easily create scans of your [FarmBot](https://farm.bot) garden, and then turn these scans into 3D gardens you can view.

For guides on how to use it, check out [the wiki](https://github.com/jonathonwolfe/chance-the-gardener/wiki).

[A demo garden has been provided](https://github.com/jonathonwolfe/chance-the-gardener/releases/tag/v1.0.0), which can be imported in the application.  
Check the [Getting Started](https://github.com/jonathonwolfe/chance-the-gardener/wiki/Getting-Started#Demo-garden-quick-start) guide in the wiki on how to view it.

The source code for the 3D garden viewer is found at [jonathonwolfe/chance-the-gardener-viewer](https://github.com/jonathonwolfe/chance-the-gardener-viewer).  
A compiled version of the garden viewer is already included with this Electron app's repository.

## Requirements
- This application needs a CUDA-enabled GPU (with at least compute capablility 2.0) in order to generate 3D gardens.  
	- https://developer.nvidia.com/cuda-gpus
	- This is because we use Meshroom.  
	More info can be found here: https://meshroom-manual.readthedocs.io/en/latest/faq/needs-cuda/needs-cuda.html

It is possible to modify the application to not require a CUDA-enabled GPU, but it is not recommended as it creates a much lower quality render.  
See here for more info: https://github.com/alicevision/meshroom/wiki/Draft-Meshing

## Things to keep in mind
### Scan Conditions
If the bot is scheduled to scan the garden, please ensure that the garden is in a relatively stable environment. 

This includes:
- Rain, fog, dust, etc. - have a cover over the garden to prevent anything from making the camera blurry and/or wipe the camera before a scan to ensure clarity.
- Ensure the scanning process happens during the night, so that the light from the LEDs is constant, without interference from sun rays that can cause high contrast spots in images.

### Storage
- Have at least 10GB of free space for a creating a scan.
- Have at least 5GB of free space for creating a 3D garden.

## Sharing Scans and 3D Gardens
This application has a built in import & export system for both scans and generated 3D gardens. 

More information about this can be found on [the wiki](https://github.com/jonathonwolfe/chance-the-gardener/wiki/Import-&-Export).

---

## Development
1. Ensure you have [Node.js](https://nodejs.org/en/download/) installed. 
2. Clone the project's repository.
3. Download and extract [Meshroom-2018.1.0-win64.zip](https://github.com/alicevision/meshroom/releases/tag/v2018.1.0) to the project's folder.
4. In the project's folder, run `npm install` to download and install dependencies.
5. Run `npm start` to launch the application.'

Your folder structure should look similar to: 

	├── garden_viewer
	├── img
	├── meshroom-2018.1.0
	│	└── Meshroom.exe
	└── node_modules

### Building
This project uses `electron-packager`. 

Run `npm run packager` to build for your platform.

The result will be found in the `packaged` folder.

Packing with this command will also ignore any generated user data such as the database, scans, and 3D gardens.

### Garden Viewer
The source code for the Unity 3D garden viewer is stored in its own repository at [jonathonwolfe/chance-the-gardener-viewer](https://github.com/jonathonwolfe/chance-the-gardener-viewer).  

A compiled version of the garden viewer is already included with this Electron app's repository.

## FarmBot API
This project makes API calls to the FarmBot system. 

For more information on API endpoints, check out FarmBot's [API Reference](https://hexdocs.pm/farmbot/api-reference.html) and [REST API Documentation](https://developer.farm.bot/v14/Documentation/web-app/rest-api).

## Disclaimer
So far, this application has only been fully tested on a small number of FarmBot garden sizes.  
While best effort has been made to account for various garden sizes, there may still be unexpected results when using this application on an untested garden size.

## Camera Quality Comparisons
Increments are the distance between 2 images — the greater the distance, the lower the quality. Currently, FarmBot devices do not support the 10mm option. The following images are provided as reference for when FarmBot does implement it in the future.
### Default FarmBot Camera - Increment Quality Comparison
![](https://raw.githubusercontent.com/jonathonwolfe/chance-the-gardener/master/img/Render-Quality-Comparison-Using-the-default-Farmbot-camera.png)
![](https://raw.githubusercontent.com/jonathonwolfe/chance-the-gardener/master/img/Render-Quality-Comparison-Using-the-default-Farmbot-camera-2.png)

### High Res Camera - Increment Quality Comparison
The high res camera used for this is a [5.0MP DEPSTECH camera](https://depstech.com/products/usb-endoscope-ntc86t).
![](https://raw.githubusercontent.com/jonathonwolfe/chance-the-gardener/master/img/Render-Quality-Comparison-Using-a-high-res-camera.png)
![](https://raw.githubusercontent.com/jonathonwolfe/chance-the-gardener/master/img/Render-Quality-Comparison-Using-a-high-res-camera-2.png)

## Credits
This application was developed as part of an undergraduate capstone project by group PS2102 of Western Sydney University, the group members are:
- Wathik Al-Qaysi (Project Manager & Application Developer)
- Jessica Lim (Project Manager & Application Developer)
- Charlie Chau ([Garden Viewer](https://github.com/jonathonwolfe/chance-the-gardener-viewer) Developer)
- Fan Wang (Application Developer)

## External Software
The 3D garden generation process uses:  
**Meshroom**  
https://github.com/alicevision/meshroom (MPLv2)

## License
This application is licensed under the [MIT license](https://github.com/jonathonwolfe/chance-the-gardener/blob/master/LICENSE).
