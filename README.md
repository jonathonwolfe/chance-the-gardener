# FarmBot 3D Garden

## The Goal of this Project
To create 3D models of a FarmBot system garden on the fly.

## FarmBot API
This project makes API calls to the FarmBot system. 
For more information on API endpoints, checkout: https://hexdocs.pm/farmbot/api-reference.html and https://developer.farm.bot/v14/Documentation/web-app/rest-api

## Requirements
- This program needs a CUDA-Enabled GPU (with at least compute capablility 2.0). https://meshroom-manual.readthedocs.io/en/latest/faq/needs-cuda/needs-cuda.html
- https://developer.nvidia.com/cuda-gpus
- run > dxdiag


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

## Sharing 3D models
If you are looking to share the 3D renders, all you have to do is to go to the folder where the application is installed, find the folder of the specific timeline of the 3D object, and share this folder. If you send it to a friend to see, they can download a free 3D viewer called MeshLab from https://www.meshlab.net/#download and install it. Once done, they can open the folder that you sent them, and double click the OBJ file.

