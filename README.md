# FarmBot 3D Garden

## The Goal of this Project
To create 3D models of a FarmBot system garden on the fly.

## FarmBot API
This project makes API calls to the FarmBot system. 
For more information on API endpoints, checkout: https://hexdocs.pm/farmbot/api-reference.html and https://developer.farm.bot/v14/Documentation/web-app/rest-api

## Requirements
- This program needs a CUDA-Enabled GPU (with at least compute capablility 2.0). https://meshroom-manual.readthedocs.io/en/latest/faq/needs-cuda/needs-cuda.html
- https://developer.nvidia.com/cuda-gpus
- To check your Graphics Card Model: Click windows icon in bottom left, type "dxdiag" and press enter to open application. Then select the Display 1 tab to see the name of your Graphics Card Model.

- There is the possibility to modify the app such that it dosent require the Graphics Card but it is not recommended by the developers as it creates a much lower quality render. See here: https://github.com/alicevision/meshroom/wiki/Draft-Meshing

## Generating renders
### First time?
- Need to download & install Node.js at https://nodejs.org/en/download/
- Need to download & install Python at https://www.python.org/downloads/
- After downloading and installing the packages above, open a cmd terminal and run the command "pip install requests" OR "pip3 install requests" (depending on install python version). This is for the auto image downloading python script to work.
- Run `npm install` once before moving on.
- This is required to install `child_process`.


### Recurring usage
1. Put your plant photos in `/images`.
2. Run the app with `npm start`.
3. Click on the Process images button.
4. Wait for progress bar to reach 100%.
5. ????
6. Check `/renders` for your output.

## Things to keep in mind
If the bot is scheduled to scan the garden, please insure that the garden is in a relatively stable environment. 
That includes:
- Rain, fog, dust, so have a cover over the garden to prevent anything from making the camera blurry.
- Insure the scanning schedule happens during the night, so the light from the LEDs is constant, without interference from sun rays that cause high contrast spots in images.
- Have atleast 10GB of free space before starting the scan process.
- Have atleast 5GB of free space before starting the render process.

## Sharing 3D models
If you are looking to share the 3D renders, all you have to do is to go to the folder where the application is installed, find the folder of the specific timeline of the 3D object, and share this folder. If you send it to a friend to see, they can download a free 3D viewer called MeshLab from https://www.meshlab.net/#download and install it. Once done, they can open the folder that you sent them, and double click the OBJ file.

## Disclaimer
- This application was only tested on a FarmBot garden size of roughly 2700mm x 1200mm. Anything bigger or smaller might result in some unexpected results and errors.

- 50mm increments. 
- 2700/50 = 54 images taken at every row. 
- 1200/50 = 24 images taken at every column. 
- 54 x 24 = 1296 images in one scan of the garden. 
- Becuase image cap is every 449 images, we need to download roughly 3 times. 
- First download roughly at Y = 400. Download 432 images here.
- Second download roughly at Y = 800. Download 432 images here.
- Third download roughly at Y = 1200. Download 432 images here.

- Full Scan 50mm Increments (FS-50) - Roughly 1300 images - 5:30PM to 4:00AM Render Time (11 Hours)

## Default FarmBot Camera Increment Quality Comparison
![Test](https://gitops.westernsydney.edu.au/professional-experience/spring-2021/PS2102/farmbot-3d-garden/-/raw/wathik/Render%20Quality%20Comparison%20(Using%20the%20default%20Farmbot%20camera).png)
![Test](https://gitops.westernsydney.edu.au/professional-experience/spring-2021/PS2102/farmbot-3d-garden/-/raw/wathik/Render%20Quality%20Comparison%20(Using%20the%20default%20Farmbot%20camera)%202.png)

## High Res Camera Increment Quality Comparison
![Test](https://gitops.westernsydney.edu.au/professional-experience/spring-2021/PS2102/farmbot-3d-garden/-/raw/wathik/Render%20Quality%20Comparison%20(Using%20a%20high%20res%20camera).png)
![Test](https://gitops.westernsydney.edu.au/professional-experience/spring-2021/PS2102/farmbot-3d-garden/-/raw/wathik/Render%20Quality%20Comparison%20(Using%20a%20high%20res%20camera)%202.png)



