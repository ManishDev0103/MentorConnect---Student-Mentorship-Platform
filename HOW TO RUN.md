Basic Steps to Run this project----------

&#x09;

&#x09;	Frontend --->Backend --->Payment Services





Step 1. Check Software Requirements



&#x09;java -version

&#x09;mvnw -version

&#x09;node -v  (checks node version)

&#x09;npm -v		(checks node package manager version)



\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*



Step 2. Database

&#x09;	

&#x09;Check application.properties -----



&#x09;					Path : MentorConnect/server/MentoshipBackend/(src/main/resources)/application.properties

&#x09;

&#x09;spring.datasource.url=jdbc:mysql://localhost:3306/mentorship?createDatabaseIfNotExist=true



&#x09;spring.datasource.username=root



&#x09;spring.datasource.password=yourPassword









\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*



Step 3. Forntend





\-Open Project Folder and type (code .) in address bar ---------project folder will open in VS code.



\-Open terminal to run front end...

&#x09;

&#x09;- Press Ctrl + ` to open terminal

&#x09;-Then type

&#x09;	

&#x09;	-cd client

&#x09;	

&#x09;		

&#x09;	-npm install (installs node modules)

&#x09;	-npm run dev (runs the frontend)

&#x09;	

&#x09;SUCCESS  -  VITE v7.2.6  ready in 3837 ms



&#x20;			➜  Local:   http://localhost:5173/

&#x09;		➜  Network: use --host to expose

&#x20; 			➜  press h + enter to show help



\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*



Step 4. Backend

&#x09;

\-Open Project Folder and type (code .) in address bar ---------project folder will open in VS code.



\-Open terminal to run  backend...



&#x09;		

&#x09;		- Press Ctrl + ` to open terminal

&#x09;			

&#x09;		-Then type

&#x09;			

&#x09;				-cd server  (change directory)

&#x09;				-cd MentorshipBackend

&#x09;				-mvnw clean install

&#x09;				-mvnw spring-boot:run

&#x09;	

&#x09;\*EXPECTED ERROR\*

&#x09;	-Port 8080 already in use …………...in that case

&#x09;	-Because another application uses port 8080

&#x09;	-FIX -->

&#x09;		

&#x09;			-Find process   -> netstat -ano | findstr :8080 (type in cmd)

&#x09;			-Kill it  	-> taskkill /PID xxxx /F

&#x09;		

&#x09;					\*\*OR\*\*





&#x09;				-Or change port number in application.properties

&#x09;					

&#x09;					-server.port=8081



OR 

&#x09;**\* use CHATGPT to fix Errors\***

&#x09;







