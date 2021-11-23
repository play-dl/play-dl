
## YouTube Cookies

Steps : - 

- Open your browser, then open dev-tools [ Option + ⌘ + J (on macOS), or Shift + CTRL + J (on Windows/Linux). ]

- Then go to Network Tab 
![image](https://user-images.githubusercontent.com/65385476/131779512-0f5773a2-f7b5-4f9d-afcb-a6d5cd97931c.png)

- Go to any YouTube URL and find the first request and open it
First Request :- 
![image](https://user-images.githubusercontent.com/65385476/131779664-9b63bca0-7036-4405-9945-a51049303665.png)

 **The first request would be watch?v="Your video ID"**

- Now go to Request Headers 
![image](https://user-images.githubusercontent.com/65385476/131779800-adc6f5b9-23e8-4252-aee5-f492d0916baa.png)

- find cookie in request headers 
![image](https://user-images.githubusercontent.com/65385476/131779829-30ffce93-536a-43c2-9266-419c7b9b745b.png)

- Now just create a new file with this code :
    ```ts
    const play = require('play-dl');
    
    play.authorization();
    ``` 
    And run this file. You will get a interface asking some question.

## Spotify

1. Go to [ Spotify Dashboard ](https://developer.spotify.com/dashboard/login) and create a new application or use old one.
![image](https://user-images.githubusercontent.com/65385476/132643880-a6831ee6-d8f7-4404-b749-0e3f3d611a64.png)

2. Open that application. You will be given 2 things [ Client ID and Client Secret ( click on `Show Client Secret` to get info ) ]. Note these 2 things somewhere.

3. Click on Edit Settings and go to Redirect URIs
![image](https://user-images.githubusercontent.com/65385476/132644797-d66b07dc-58cc-4fbd-80a9-6b938be138a9.png)

4. Add this Redirect URI : `http://127.0.0.1/index.html` or any url according to you. [ Also note this somewhere ]

5. Now create a `authorize.js` file and add this code :
    ```ts
    const play = require('play-dl');
    
    play.authorization();
    ``` 
    and run it `node authorize.js`

6. You will be asked :-
     - Saving INFO in file or not. [ If selected no, you will have to use `setToken` function after you get refresh-Token ]
     - Client ID
     - Client Secret
     - Redirect URI or Redirect URL
     - Market [ Choose 2 letter code on left side of your country name from [url](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) ]
     - You will be given a link for authorizing. Just paste it in your browser and click on authorize and copy the link that you are redirected to. [ Redirected Link should start with Redirect URI / Redirect URL that you have provided ]
     - Paste the url in Redirected URL

7. You have completed Authorization part. Now you can delete authorize js file. 

You will notice that a folder named `.data` has been created. **Do not delete this**, this contains all your spotify data. [ Only applicable if save in file is set to yes. ]

## SoundCloud

## Getting Free Client ID

``` ts
const play = require('play-dl')

play.getFreeClientID().then((clientID) => {
    play.setToken({
      soundcloud : {
          client_id : clientID
      }
    })
})
```