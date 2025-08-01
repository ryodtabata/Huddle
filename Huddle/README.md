# Starter Template with React Navigation

This is a React Native app, build to run across all mobile devices

# Starting the app

npm i
npm run web/android/ios

will need to contact ryotabata for the config file, not included in git becuase includes the api key and havbent gotten around to setup .env file yet...

# what needs to be implemented still ... to do list if you will

TO LOG OUT PRESS THE ACCOUNT INFO BUTTON IN SETTINGS-> NO OTHER SETTINGS BUTTONS ARE FUNTIONAL

-google sign up/sign in does not work still
-forget password is not implemented
-i need to make a logo and neew colour sheme

-sign up screen, i want it to only be first name, dont really need last name
-more robust sign up password (ie at least 8 digits wit a symbol and number)
-once done singing up, need to create the doc ie-->
upload a photo
bio
tags
privacy set up ios important
ask permission for location

FIXED EDIT PROFILE!!
but there is still a bug with bio being too long
need to implement rules to limit characters for name, tags bio etc
settigs has too many options i dont care about
settings needs to be actually implemented
friends list/addfriends/block/unadd/report all broken/not implemented need to do that

BUGS:
lots of viewing bugs depending if on phone or web, or i assume android.

TESTING:
location stuff seems weird still
radius decision---> for now max -> then make it editable
decision about how often api calls should be made ? best way to do it with limited write/fetches

NOTE:
ADD TO FIREBASECONFIG
import { getStorage } from 'firebase/storage';
export const storage = getStorage(app);

NOTE:
NEED TO CHANGE RULES EVENTUALLY
