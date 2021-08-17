import requests
import json


url = "https://my.farm.bot/api/images"

payload={}
headers = {
  'Authorization': '***REMOVED***',
  'Cookie': '__farmbot_session=CrocDXZpsWEZnldGTG615awf8tm9zjtemWYXJMLxhFNji0OK%2BDT%2BoKJZrd%2BErzhOp5XMNDaAKMJoGRGk7UaRKcz7DV9l9YF%2B8G5RLFKNhDGnkvy7P8jtChO7vujkgs4NJxyO%2FUT2xhfcZ0sjOLToWXvafBDy8FGTILv0zge%2BCbYtUgcuI0gY9TM9Wgcw6shwjT%2FSySn9G3Gz--eOxINbhViZXvZVoz--VMulFuE%2FgA26VlCJBaEUow%3D%3D'
}

#Retrive data 
response = requests.request("GET", url, headers=headers, data=payload)

#convert json string to python dictionary
input = json.loads(response.text)

response = requests.get(url)
# x is the number of images the user want to download
x = 5
# 0 is the newest images, it will be downloaded first, then the second newest, and so on. 
i = 0
while i <= x:

    #Select the data of ith image
    z= input[i]

    #Print the ith image's url
    print z["attachment_url"]
    
    r = requests.get(z["attachment_url"], allow_redirects=True)
    
    #Save the file to current folder
    open(str(i)+".jpeg", 'wb').write(r.content)
    
    #Go to the next(older) image
    i += 1

