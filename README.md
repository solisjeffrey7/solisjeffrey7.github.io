========================================
PROFILE.INFO FORMAT GUIDE
Lost Item / Contact Profile
========================================


1. LOCATION
----------------------------------------

Ang Profile.info ay dapat nasa:

public/Profile.info


========================================
2. MAIN PROFILE
========================================

Gamitin ang format:

[profile-id]

name=Name
subtitle=Subtitle
photo=photo.jpg
address=Address
city=City
phone=Phone Number
sms=Phone Number
messenger=Messenger URL
facebook=Facebook URL
email=Email Address
maps=Google Maps URL


Example:

[jeffrey]
name=Jeffrey Solis
subtitle=Lost Item
photo=wallet.jpg
address=Jose Panganiban
city=Camarines Norte, Philippines
phone=+639XXXXXXXXX
sms=+639XXXXXXXXX
messenger=https://m.me/USERNAME
facebook=https://www.facebook.com/USERNAME
email=your@email.com
maps=https://www.google.com/maps/search/?api=1&query=Jose+Panganiban+Camarines+Norte


========================================
3. PROFILE ID
========================================

Ang nasa loob ng [ ] ang ginagamit sa URL.

Example:

[jeffrey]

URL:

https://solisjeffrey7.github.io/?profile=jeffrey


Another example:

[rovelyn]

URL:

https://solisjeffrey7.github.io/?profile=rovelyn


Profile IDs are case-insensitive.

[Jeffrey]

at

[jeffrey]

ay parehong profile.


========================================
4. OTHER PEOPLE
========================================

Para maglagay ng Other People sa isang
profile, gamitin:

[profile-id][other]

Example:

[jeffrey][other]
name=Rovelyn Solis
subtitle=Wife
photo=rovelyn.jpg
phone=+639XXXXXXXXX
sms=+639XXXXXXXXX
messenger=https://m.me/ROVELYN
facebook=https://www.facebook.com/ROVELYN


Another Other Person:

[jeffrey][other]
name=Juan Solis
subtitle=Brother
photo=juan.jpg
phone=+639XXXXXXXXX
sms=+639XXXXXXXXX
messenger=https://m.me/JUAN
facebook=https://www.facebook.com/JUAN


Lahat ng [jeffrey][other] ay lalabas sa
ibaba ng Jeffrey profile.


========================================
5. BAWAT PROFILE MAY SARILING OTHER PEOPLE
========================================

Halimbawa:

[jeffrey]
name=Jeffrey Solis
subtitle=Lost Item
photo=wallet.jpg

[jeffrey][other]
name=Rovelyn Solis
subtitle=Wife
photo=rovelyn.jpg

[jeffrey][other]
name=Juan Solis
subtitle=Brother
photo=juan.jpg


[rovelyn]
name=Rovelyn Solis
subtitle=Contact Profile
photo=rovelyn.jpg

[rovelyn][other]
name=Jeffrey Solis
subtitle=Husband
photo=profile.jpg

[rovelyn][other]
name=Juan Solis
subtitle=Brother
photo=juan.jpg


Kapag:

?profile=jeffrey

Jeffrey profile + Jeffrey's Other People
ang lalabas.


Kapag:

?profile=rovelyn

Rovelyn profile + Rovelyn's Other People
ang lalabas.


========================================
6. PHOTO
========================================

Ang photo file ay dapat nasa:

public/

Example:

public/
    Profile.info
    profile.jpg
    rovelyn.jpg
    juan.jpg
    wallet.jpg


Sa Profile.info:

photo=profile.jpg

photo=rovelyn.jpg

photo=wallet.jpg


Kung walang photo= line,
automatic gagamit ng default user icon.


Example:

[juan]
name=Juan Solis
subtitle=Brother
phone=+639XXXXXXXXX

Walang photo.

Automatic default icon ang lalabas.


========================================
7. NAME
========================================

name= ay pangalan na ipapakita.

Example:

name=Rovelyn Solis


Para sa Other Person:

[jeffrey][other]
name=Rovelyn Solis
subtitle=Wife


Ang full name ay nasa sariling linya
at hindi dapat mawala kahit mahaba.


========================================
8. SUBTITLE
========================================

subtitle= ay maliit na description
sa ilalim ng pangalan.

Examples:

subtitle=Lost Item

subtitle=Owner

subtitle=Wife

subtitle=Brother

subtitle=Friend

subtitle=Contact Profile


========================================
9. PHONE
========================================

phone= ay ginagamit para sa CALL button.

Example:

phone=+639171234567


Kapag may phone=,
automatic lalabas ang Call button.


========================================
10. SMS
========================================

sms= ay ginagamit para sa SMS button.

Example:

sms=+639171234567


========================================
11. MESSENGER
========================================

Gamitin ang Messenger URL.

Example:

messenger=https://m.me/USERNAME


========================================
12. FACEBOOK
========================================

Gamitin ang Facebook profile URL.

Example:

facebook=https://www.facebook.com/USERNAME


========================================
13. EMAIL
========================================

Example:

email=example@gmail.com


Kapag may email=,
automatic lalabas ang Email button.


========================================
14. GOOGLE MAPS
========================================

Example:

maps=https://www.google.com/maps/search/?api=1&query=Jose+Panganiban+Camarines+Norte


Kapag may maps=,
automatic lalabas ang Google Maps button.


========================================
15. OPTIONAL FIELDS
========================================

Hindi kailangang ilagay lahat.

Example:

[juan]
name=Juan Solis
subtitle=Brother
phone=+639XXXXXXXXX


Okay lang ito.


Pwede rin:

[juan]
name=Juan Solis
subtitle=Brother
photo=juan.jpg


Okay din ito.


========================================
16. LOST ITEM EXAMPLE
========================================

[wallet]
name=Black Wallet
subtitle=LOST ITEM
photo=wallet.jpg
address=Jose Panganiban
city=Camarines Norte, Philippines
phone=+639XXXXXXXXX
sms=+639XXXXXXXXX
messenger=https://m.me/USERNAME
facebook=https://www.facebook.com/USERNAME
maps=https://www.google.com/maps/search/?api=1&query=Jose+Panganiban+Camarines+Norte


========================================
17. LOST ITEM WITH OTHER CONTACTS
========================================

[wallet]
name=Black Wallet
subtitle=LOST ITEM
photo=wallet.jpg
address=Jose Panganiban
city=Camarines Norte, Philippines
phone=+639XXXXXXXXX
sms=+639XXXXXXXXX
messenger=https://m.me/USERNAME
facebook=https://www.facebook.com/USERNAME
maps=https://www.google.com/maps/search/?api=1&query=Jose+Panganiban+Camarines+Norte


[wallet][other]
name=Rovelyn Solis
subtitle=Contact Person
photo=rovelyn.jpg
phone=+639XXXXXXXXX
sms=+639XXXXXXXXX
messenger=https://m.me/ROVELYN


[wallet][other]
name=Juan Solis
subtitle=Contact Person
phone=+639XXXXXXXXX
sms=+639XXXXXXXXX
messenger=https://m.me/JUAN


========================================
18. MULTIPLE PROFILES
========================================

[jeffrey]
name=Jeffrey Solis
subtitle=Contact Profile
photo=profile.jpg


[rovelyn]
name=Rovelyn Solis
subtitle=Contact Profile
photo=rovelyn.jpg


[juan]
name=Juan Solis
subtitle=Contact Profile
photo=juan.jpg


URLs:

?profile=jeffrey

?profile=rovelyn

?profile=juan


========================================
19. IMPORTANT RULES
========================================

1. Huwag alisin ang [ ] sa profile ID.

2. Ang [profile][other] ay dapat may
   existing parent profile.

3. Isang profile section lamang bawat
   profile ID.

4. Maaaring magkaroon ng maraming:

   [profile][other]

5. Optional ang photo.

6. Optional ang phone, SMS, Messenger,
   Facebook, Email at Maps.

7. Kapag walang contact information,
   walang corresponding button na lalabas.

8. Ang Profile.info ay dapat nasa:

   public/Profile.info

9. Ang image files ay dapat nasa:

   public/


========================================
20. COMPLETE EXAMPLE
========================================

[jeffrey]
name=Jeffrey Solis
subtitle=Contact Profile
photo=profile.jpg
address=Jose Panganiban
city=Camarines Norte, Philippines
phone=+639XXXXXXXXX
sms=+639XXXXXXXXX
messenger=https://m.me/JEFFREY
facebook=https://www.facebook.com/JEFFREY
email=jeffrey@example.com
maps=https://www.google.com/maps/search/?api=1&query=Jose+Panganiban+Camarines+Norte

[jeffrey][other]
name=Rovelyn Solis
subtitle=Wife
photo=rovelyn.jpg
phone=+639XXXXXXXXX
sms=+639XXXXXXXXX
messenger=https://m.me/ROVELYN
facebook=https://www.facebook.com/ROVELYN

[jeffrey][other]
name=Juan Solis
subtitle=Brother
photo=juan.jpg
phone=+639XXXXXXXXX
sms=+639XXXXXXXXX
messenger=https://m.me/JUAN
facebook=https://www.facebook.com/JUAN


[rovelyn]
name=Rovelyn Solis
subtitle=Contact Profile
photo=rovelyn.jpg
phone=+639XXXXXXXXX
sms=+639XXXXXXXXX
messenger=https://m.me/ROVELYN
facebook=https://www.facebook.com/ROVELYN

[rovelyn][other]
name=Jeffrey Solis
subtitle=Husband
photo=profile.jpg
phone=+639XXXXXXXXX
sms=+639XXXXXXXXX

[rovelyn][other]
name=Juan Solis
subtitle=Brother
photo=juan.jpg
phone=+639XXXXXXXXX
sms=+639XXXXXXXXX


========================================
END OF PROFILE.INFO GUIDE
========================================