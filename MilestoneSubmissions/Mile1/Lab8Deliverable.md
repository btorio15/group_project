Lab 8 Document: Mile 1  
**Team Number:** 1  
**Team Name:** Bathroom Boys

**Team Members:** 

* Lucas Velyvis, Github: [https://github.com/luve5594](https://github.com/luve5594), [luve5594@colorado.edu](mailto:luve5594@colorado.edu)  
* Benjamin Torio Github: [https://github.com/btorio15](https://github.com/btorio15), [beto3809@colorado.edu](mailto:beto3809@colorado.edu)  
* Wylie Knapek, Github: [https://github.com/WylieKnapek](https://github.com/WylieKnapek), [wykn3731@colorado.edu](mailto:wykn3731@colorado.edu)  
* John Bass, Github: [https://github.com/John-Bass72](https://github.com/John-Bass72) , [joba3322@colorado.edu](mailto:joba3322@colorado.edu)

Application Name: Amenity Tracker (WIP)

**Application Description:**   
The application will show a map with pins on locations with amenities in Boulder, CO. Users will be prompted to log in or register upon accessing the application, and then they will be able to initially see the map with default amenity locations added to it by the developers sourced from online data.   
Beyond that, any user can submit a location of their own to appear on the site, with information about the type of amenity, address, and any pertinent information regarding the amenity that might be of use to other users. Users can update the information listed on the application already that others have posted or that comes default to initializing the application.  
The map will be pulled from Google Maps API to load the map of Boulder and the pins will be placed over the map for users to see. We reserve the option to expand the application to show the entire country’s amenities if Boulder is too limited.

**Audience:**   
People who use this app are people who would appreciate support in exploration of new places. Having an accessible source of information on bathrooms/wifi/water makes both exploration and existing in a foreign place more manageable. Students looking for study spots, tourists looking for comfort while touring, residents who are interested in learning about their community. This means that mobile integration is a must for people on the move.

**Vision Statement:**   
For students/visitors/residents, Who want to know of useful amenities in Boulder. The Amenity Tracker is an application that allows users to find and upload helpful amenities such as bathrooms, spots with the best free wifi, study spots, etc. Unlike showermap which provides locations of public showers across every state. Our product, Amenity Tracker, focuses only on Boulder and provides many more options of convenient spots people can find.

**Version Control:**  
 [https://github.com/btorio15/group\_project](https://github.com/btorio15/group_project)  
**Development Methodology:**   
Agile Development

**Communication Plan:**  
	We plan to communicate through discord which is linked above. We have different channels for different tasks relating to the project categories.

**Meeting Plan:**   
	Regularly scheduled meetings will occur on Wednesday at 6:30pm on discord voice chat to discuss the weekly TA meeting and the plan for our individual contributions over the course of the next week. In person meetings will be scheduled as needed.  
	The TA meeting will occur at 4:40pm on Wednesday on zoom.

**Use Case Diagram/Wireframes:**   
	See associated directories in Mile1 on github

**Potential Risks:**

1. API  
   1. The Google Maps API is integral to our product. If the API shifts from a free model to a paid only model, we risk losing the map capability that is so central to our functionality. Consistently monitoring the TOS of the API, and keeping a list of suitable backup APIs to leverage will mitigate some of the risk.  
2. Data Accuracy  
   1. The data we are tracking for users is always subject to change. The same with Google Maps, locations can move addresses, open and close, and overall introduce variance to the precision of our offering of data. This is a severe but slow onset risk. We can mitigate this by giving users the option to submit location corrections and reviews, to better add to the accuracy of our locations and their associated data.   
3. Open Content/Crowdsourcing  
   1. Giving users the option to submit location additions/edits is good to mitigate our data accuracy risk, but it introduces the new risk of inaccurate/malicious data addition requests. Users and humans in general can make mistakes when submitting information. We can mitigate this with automated filters (duplicate detection, spam flagging), designing a tiered trust system where established contributors get faster approval, and planning for volunteer moderator roles as the community grows.  
4. Lack of location data  
   1. With currently no users to service, we have no demand for more data for certain locations. With big cities planned primarily, as user base grows, the user density also covers a wider area. Some of these users might want data for areas we haven’t submitted information for, and since we don't live near those places, we have limited ways of accessing that information. Users come to the site for the data, and while some data comes from users, It’s not  the primary objective of the site to collect data. We cannot count on Crowdsourcing to fill the empty areas of our map completely, and we risk under-serving our userbase. We can mitigate this by monitoring feedback and contact lines with users, as well as moderating rural and suburban location update requests vigilantly.  
5. Collection of Sensitive Data  
   1. With any application that uses location data, users are always worried about privacy and data collection. Frequent searches, location data, and search time can almost entirely identify a user's behavior. In order to mitigate the risk of public opinion dropping due to privacy concerns, a clear and concise privacy statement and minimal data collection will be necessary. 

