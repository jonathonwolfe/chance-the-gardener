# main.py
import sys
import requests
import json

if __name__ == "__main__":
    print(f"Arguments count: {len(sys.argv)}")

# Arg 1 is link
# Arg 2 is file name
# Arg 3 is folder (To be implemented)

url = "https://my.farm.bot/api/images"
payload={}
headers = {
  'Authorization': '***REMOVED***',
  'Cookie': '__farmbot_session=CrocDXZpsWEZnldGTG615awf8tm9zjtemWYXJMLxhFNji0OK%2BDT%2BoKJZrd%2BErzhOp5XMNDaAKMJoGRGk7UaRKcz7DV9l9YF%2B8G5RLFKNhDGnkvy7P8jtChO7vujkgs4NJxyO%2FUT2xhfcZ0sjOLToWXvafBDy8FGTILv0zge%2BCbYtUgcuI0gY9TM9Wgcw6shwjT%2FSySn9G3Gz--eOxINbhViZXvZVoz--VMulFuE%2FgA26VlCJBaEUow%3D%3D'
}

r = requests.get(sys.argv[1], allow_redirects=True)
    
# Save the file to current folder
open('img\\'+sys.argv[2]+".jpeg", 'wb').write(r.content)
