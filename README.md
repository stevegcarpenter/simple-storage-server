```
   _____ _                 _         _____ _                                _____
  / ____(_)               | |       / ____| |                              / ____|
 | (___  _ _ __ ___  _ __ | | ___  | (___ | |_ ___  _ __ __ _  __ _  ___  | (___   ___ _ ____   _____ _ __
  \___ \| | '_ ` _ \| '_ \| |/ _ \  \___ \| __/ _ \| '__/ _` |/ _` |/ _ \  \___ \ / _ \ '__\ \ / / _ \ '__|
  ____) | | | | | | | |_) | |  __/  ____) | || (_) | | | (_| | (_| |  __/  ____) |  __/ |   \ V /  __/ |
 |_____/|_|_| |_| |_| .__/|_|\___| |_____/ \__\___/|_|  \__,_|\__, |\___| |_____/ \___|_|    \_/ \___|_|
                    | |                                        __/ |
                    |_|                                       |___/
```
[![Build Status](https://travis-ci.org/stevegcarpenter/simple-storage-server.svg?branch=master)](https://travis-ci.org/stevegcarpenter/simple-storage-server)

This is a basic implementation of a RESTful API for simple file storage. It allows users to
register for an account and sign in to get a Bearer authorization token which is required
for uploading, fetching, and deleting files. The files are all stored in an Amazon AWS S3
bucket, so it is necessary for users to have an AWS account with correct credentials and a
remote bucket to store files in. Files are all stored in the S3 bucket on a per-user basis
so there are no issues with collisions when different users upload identical files.

Users
- POST - `/register` - Create an account with username, password, and email address
- GET - `/login` - Sign into account to receive back a token

Files
- POST - `/files/<filename>` - Upload a file to the users personal storage
- GET - `/files/:<filename>?` - Get a single file or a list of all files owned by the user
- DELETE - `/files/<filename>` - Delete a single file

## Setup

A number of steps are necessary to setup this RESTful API.

- Clone the git repository from [stevegcarpenter/simple-storage-server](https://github.com/stevegcarpenter/simple-storage-server)
- Navigate to the repository and run `npm install` inside to install all necessary node packages
  - Directions to install the `npm` package manager can be found [here](https://www.npmjs.com/get-npm) for those that do not already have this installed
- Install a tool to make HTTP requests. [HTTPie](https://httpie.org/) is the tool used for this guide.
  - Another popular alternative is [Postman](https://www.getpostman.com/)
- Sign up for an AWS account and create a user with read/write permissions to an S3 bucket you create
  - Safely store the access key id and secret access key as these will be needed
- Setup both a `__test__/lib/.test.env` and `.env` file as follows
  - It is recommended to use another port for testing such as 4000 and possibly a test S3 bucket as well
```
PORT=3000
MONGODB_URI='mongodb://localhost/sfsdb'
APP_SECRET='<a-long-random-string>'

AWS_BUCKET='<your-s3-bucket-name>'
AWS_ACCESS_KEY_ID='<your-access-key-id>'
AWS_SECRET_ACCESS_KEY='<your-secret-access-key>'
```

## Using the API
Once all the setup is complete, it is possible to run all the unit and route tests by executing
`npm run test` in the terminal within the project directory. This will report on any bugs and
display overall coverage statistics for tests. The remaining portion of this section details how
to use [HTTPie](https://httpie.org/) to interact with the RESTful API.

## Testing
This project uses continuous integration via Travis-CI which can be accessed
using the Build tag above, but once the files are cloned to a local directory
and the respective `__test__/lib/.test.env` file has been populated with the
appropriate AWS Keys and bucket information users can run the full test suite
by executing `npm run test`. This is a current output of all unit and integration
tests for the project.
```
 PASS  __test__/integration-auth/auth-get.test.js (9.925s)
  Auth POST
    /login
      Valid
        ✓ should respond with a status of 200 for a valid login (8ms)
        ✓ should respond with a Content-Type of application/json (1ms)
        ✓ should successfully return back a token string in the body (3ms)
        ✓ should return a JSON Web Token in the response body (3ms)
      Invalid
        ✓ should respond with a 403 if an invalid password was given (269ms)
        ✓ should respond with a 403 if an username was given (10ms)
        ✓ should respond with Content-Type application/json on 403 error (8ms)
        ✓ should respond with a 403 (NOT AUTHORIZED) status given missing username (5ms)
        ✓ should respond with a 403 (NOT AUTHORIZED) status given missing password (4ms)
        ✓ should respond with a 403 (NOT AUTHORIZED) status given malformed user headers (4ms)

  console.log lib/server.js:27
    listening on 4000

 PASS  __test__/integration-file/file-get.test.js
  Files GET
    /files/:filename
      Valid
        ✓ should respond with a status of 200 (OK) on success (3ms)
        ✓ should respond with a Content-Type of application/json (1ms)
      Invalid
        ✓ should respond with a 404 (NOT FOUND) status if a user tries to get a non-existent file (12ms)
        ✓ should respond with 403 (FORBIDDEN) status when a user tries to get a file without a token (5ms)
        ✓ should respond with 403 (FORBIDDEN) status when a user tries to get a file with an invalid token (5ms)
        ✓ should respond with 404 (NOT FOUND) if a user tries to fetch another users file (277ms)
    /files
      Valid
        ✓ should respond with a status of 200 (OK) on successful retrieval of the users files
        ✓ should respond with a Content-Type of application/json (1ms)
        ✓ should have returned an array of the 2 files this user uploaded (1ms)
        ✓ should return no filenames for a new user that doesn't own any of the first users files (268ms)
      Invalid
        ✓ should respond with 403 (FORBIDDEN) status when a user tries to get files without a token (5ms)
        ✓ should respond with 403 (FORBIDDEN) status when a user tries to get files with an invalid token (4ms)

  console.log lib/server.js:27
    listening on 4000

 PASS  __test__/integration-file/file-post.test.js
  Files POST
    /files/:filename
      Valid
        ✓ should respond with a status of 201 (CREATED) on success (3ms)
        ✓ should respond with a Content-Type of application/json (1ms)
        ✓ should return the name of the file that was uploaded (1ms)
        ✓ should allow different users to upload the same file without overwriting (450ms)
      Invalid
        ✓ should respond with a 409 (CONFLICT) status if a user tries to upload the same file twice (18ms)
        ✓ should respond with 403 (FORBIDDEN) status when a file is uploaded without a token (13ms)
        ✓ should respond with 403 (FORBIDDEN) status when a file is uploaded with an invalid token (9ms)

  console.log lib/server.js:27
    listening on 4000

 PASS  __test__/integration-file/file-delete.test.js
  Files DELETE
    /files/:filename
      Valid
        ✓ should respond with a status of 204 (NO CONTENT) on successful deletion of a file (3ms)
      Invalid
        ✓ should respond with a 404 (NOT FOUND) status if a user tries to delete a non-existent file (13ms)
        ✓ should respond with 403 (FORBIDDEN) status when a user tries to delete a file without a token (4ms)
        ✓ should respond with 403 (FORBIDDEN) status when a user tries to delete a file with an invalid token (4ms)
        ✓ should respond with 404 (NOT FOUND) if a user tries to delete another users file (270ms)

  console.log lib/server.js:27
    listening on 4000

 PASS  __test__/integration-auth/auth-post.test.js
  Auth POST
    /register
      Valid
        ✓ should return a 204 (NO CONTENT) status on successful registration (582ms)
      Invalid
        ✓ should respond with a 404 (NOT FOUND) status if a fake path is given (14ms)
        ✓ should respond with a 409 (CONFLICT) status if the registration crdentials are taken already (2ms)
        ✓ should respond with a content-type application/json on 400 (BAD REQUEST) failure (6ms)
        ✓ should respond with a 400 (BAD REQUEST) status if no body was provided (5ms)
        ✓ should respond with a 400 (BAD REQUEST) status if no username was provided (6ms)
        ✓ should respond with a 400 (BAD REQUEST) status if no password was provided (5ms)
        ✓ should respond with a 400 (BAD REQUEST) status if no email was provided (4ms)
        ✓ should respond with a 400 (BAD REQUEST) status if username is < 3 characters (8ms)
        ✓ should respond with a 400 (BAD REQUEST) status if username is > 20 characters (4ms)
        ✓ should respond with a 400 (BAD REQUEST) status if username not alphanumeric (5ms)
        ✓ should respond with a 400 (BAD REQUEST) status if the password is < 8 characters (4ms)

 PASS  __test__/unit/file.test.js
  File Module
    ✓ Should have an _id property (3ms)
    ✓ Should have a filename property (4ms)
    ✓ Should have a userId property (2ms)
    ✓ Should have a objectKey property (2ms)
    ✓ Should have a fileURI property (1ms)
    ✓ should be an instance of an Object (1ms)

 PASS  __test__/unit/auth.test.js
  Auth Module
    ✓ Should have an _id property (3ms)
    ✓ Should have a username property (3ms)
    ✓ Should have a password property (1ms)
    ✓ Should have a compareHash property (1ms)
    ✓ should be an instance of an Object (1ms)

 PASS  __test__/unit/error-handler.test.js
  Error Handler
    ✓ should return an error 409 for any error containing Duplicate Key (3ms)
    ✓ should return an error 404 for any error containing ObjectId Failed, ENOENT, or path error (2ms)
    ✓ should return an error 400 for any error containing Validation Error (1ms)
    ✓ should return an error 500 for any other errors that occur (1ms)

----------------------------|----------|----------|----------|----------|-------------------|
File                        |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------------------------|----------|----------|----------|----------|-------------------|
All files                   |    93.36 |    84.38 |    90.91 |    94.61 |                   |
 lib                        |    92.31 |    78.79 |    89.47 |    94.19 |                   |
  aws-s3.js                 |      100 |       50 |      100 |      100 |             10,16 |
  basic-auth-middleware.js  |    93.33 |     87.5 |      100 |    93.33 |                 8 |
  bearer-auth-middleware.js |    86.96 |       75 |       75 |       95 |                30 |
  error-handler.js          |      100 |      100 |      100 |      100 |                   |
  server.js                 |    90.91 |       50 |    85.71 |    90.91 |          18,24,38 |
 model                      |    90.91 |     62.5 |    88.89 |    92.59 |                   |
  auth.js                   |    89.66 |       75 |    83.33 |    92.86 |             21,48 |
  file.js                   |    92.31 |       50 |      100 |    92.31 |             20,22 |
 route                      |    96.92 |      100 |     93.1 |    96.88 |                   |
  route-auth.js             |    97.14 |      100 |    90.91 |    97.14 |                52 |
  route-file.js             |    96.67 |      100 |    94.44 |    96.55 |                42 |
----------------------------|----------|----------|----------|----------|-------------------|
Test Suites: 8 passed, 8 total
Tests:       61 passed, 61 total
Snapshots:   0 total
Time:        21.073s, estimated 22s
Ran all test suites.
```

### Create an account
For creating an account, there are a few requirements.
Usernames must be:
- At least 3 characters and no more then 20 characters
- Only alphanumeric
Passwords must be:
- At minimum 8 characters
```
http POST :3000/register username=<desired-username> password=<desired-password> email=<your-email@domain.com>

Example:
========
http POST :3000/register username=steve password=password email=s@s.com

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: *
Connection: keep-alive
Date: Wed, 18 Apr 2018 07:51:31 GMT
ETag: W/"a-bAsFyilMr4Ra1hIU5PyoyFRunpI"
X-Powered-By: Express
```

### Login to get a token
When logging in, a username and password must be specified as part of the
authorization header. This can be done with HTTPie using the `-a` flag.
```
http -a <username>:<password> GET :3000/login

Example:
========
http -a steve:password GET :3000/login

HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 293
Content-Type: application/json; charset=utf-8
Date: Wed, 18 Apr 2018 05:42:44 GMT
ETag: W/"125-oXk6pPGfke6GsghTVGz6zZ5O7Jc"
X-Powered-By: Express

"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjkyMmFiYzZiYjAyYzI3NjE5YTA1YjA3NmM0OGJiNTk4MWUwODM3Y2UwOTQ0OGIxOGQ0ODVjNDQ2YzIyZmI5OTc5YjMwN2NmZjUwYTZkMzYwZWZhMjM3NmNlZmFlNWQ1ZWQ0MTUxODEwZTI2ODhlMzkwYjA3NjYwNDdmNTIwNTMxIiwiaWF0IjoxNTI0MDMwMTY0fQ.RpYsuVoH_JHLyls0D9c95C1h6LlBqDnJgU72alY1Ma0"
```

### Upload a file
When uploading a file, the file needs to be sent as form data which is
accomplished in HTTPie using the `-f` flag and specifying the file to be
uploaded using `file@` followed by the full or relative filepath. Once the
Bearer token provided has been validated and the user located in the database
the file will be uploaded to the S3 bucket specified in the `.env` file.
Following a successful upload, the file data is stored inside the MongoDB
database and a 201 status is returned to the user. Different users are allowed
to upload identical files since all the files are separated into their own
namespace by user ids within the S3 bucket. Since this is a POST route, users
are not allowed to overwrite files with pre-existing files. If they wish to
upload a new copy the file must first be deleted using the DELETE route.
```
http -f POST :3000/files/<desired-filenamet> file@</path/to/file.ext> 'Authorization:Bearer
<token>'

Example:
========
http -f POST :3000/files/baz.jpg file@~/Downloads/2.jpg 'Authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjkyMmFiYzZiYjAyYzI3NjE5YTA1YjA3NmM0OGJiNTk4MWUwODM3Y2UwOTQ0OGIxOGQ0ODVjNDQ2YzIyZmI5OTc5YjMwN2NmZjUwYTZkMzYwZWZhMjM3NmNlZmFlNWQ1ZWQ0MTUxODEwZTI2ODhlMzkwYjA3NjYwNDdmNTIwNTMxIiwiaWF0IjoxNTI0MDMwMTY0fQ.RpYsuVoH_JHLyls0D9c95C1h6LlBqDnJgU72alY1Ma0'

HTTP/1.1 201 Created
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 29
Content-Type: application/json; charset=utf-8
Date: Wed, 18 Apr 2018 06:56:51 GMT
ETag: W/"1d-y8BomfIcNC7oA5hAn9SCxxmrC48"
X-Powered-By: Express

{
    "Location": "/files/baz.jpg"
}
```

### Get list of all uploaded filenames
Making a GET request to the `/files` endpoint without a specific filename will
fetch all the files associated with this one user from the database. It then
returns this list as shown below. Since the files are all separated by user, a
GET request from one user will not return any files from another users personal
filesystem.
```
http GET :3000/files 'Authorization:Bearer <token>'

Example:
========
http GET :3000/files 'Authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjkyMmFiYzZiYjAyYzI3NjE5YTA1YjA3NmM0OGJiNTk4MWUwODM3Y2UwOTQ0OGIxOGQ0ODVjNDQ2YzIyZmI5OTc5YjMwN2NmZjUwYTZkMzYwZWZhMjM3NmNlZmFlNWQ1ZWQ0MTUxODEwZTI2ODhlMzkwYjA3NjYwNDdmNTIwNTMxIiwiaWF0IjoxNTI0MDMwMTY0fQ.RpYsuVoH_JHLyls0D9c95C1h6LlBqDnJgU72alY1Ma0'

HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 31
Content-Type: application/json; charset=utf-8
Date: Wed, 18 Apr 2018 07:04:13 GMT
ETag: W/"1f-1AgUjnH/5sIvcsHcPjUSHTcDRBw"
X-Powered-By: Express

[
    "foo.jpg",
    "bar.jpg",
    "baz.jpg"
]
```

### Get a single file
Making a GET request with a specific file will trigger an actual download of
the file from the AWS S3 bucket. Given that the users token is valid, it will
return this file with a 200 status.
```
http GET :3000/files/<filename> 'Authorization:Bearer <token>'

Example:
========
http GET :3000/files/foo.jpg 'Authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjkyMmFiYzZiYjAyYzI3NjE5YTA1YjA3NmM0OGJiNTk4MWUwODM3Y2UwOTQ0OGIxOGQ0ODVjNDQ2YzIyZmI5OTc5YjMwN2NmZjUwYTZkMzYwZWZhMjM3NmNlZmFlNWQ1ZWQ0MTUxODEwZTI2ODhlMzkwYjA3NjYwNDdmNTIwNTMxIiwiaWF0IjoxNTI0MDMwMTY0fQ.RpYsuVoH_JHLyls0D9c95C1h6LlBqDnJgU72alY1Ma0'

HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 256
Content-Type: application/json; charset=utf-8
Date: Wed, 18 Apr 2018 07:10:53 GMT
ETag: W/"100-dvRDAcv/tW6yEs7tQw4p2zcb8/U"
X-Powered-By: Express

[
    {
        "__v": 0,
        "_id": "5ad6ec1b352970419214e0e8",
        "fileURI": "https://simple-file-storage.s3.amazonaws.com//files/1a05a54203f36ab860f2ad83ea224080.jpg",
        "name": "foo.jpg",
        "objectKey": "/files/1a05a54203f36ab860f2ad83ea224080.jpg",
        "userId": "5ad6c848475c0e138d3df20e"
    }
]
```

### Delete a file
Any file associated with a particular user can be deleted only by that user by
using the DELETE route and the specific filename. No user is allowed to delete
files from any other users account which is verified using the JSON web token
at time of the request.
```
http DELETE :3000/files/<filename> 'Authorization:Bearer <token>'

Example:
========
http DELETE :3000/files/foo.jpg 'Authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjkyMmFiYzZiYjAyYzI3NjE5YTA1YjA3NmM0OGJiNTk4MWUwODM3Y2UwOTQ0OGIxOGQ0ODVjNDQ2YzIyZmI5OTc5YjMwN2NmZjUwYTZkMzYwZWZhMjM3NmNlZmFlNWQ1ZWQ0MTUxODEwZTI2ODhlMzkwYjA3NjYwNDdmNTIwNTMxIiwiaWF0IjoxNTI0MDMwMTY0fQ.RpYsuVoH_JHLyls0D9c95C1h6LlBqDnJgU72alY1Ma0'

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: *
Connection: keep-alive
Date: Wed, 18 Apr 2018 07:44:28 GMT
ETag: W/"a-bAsFyilMr4Ra1hIU5PyoyFRunpI"
X-Powered-By: Express
```

## Author
- ![Steven Carpenter](https://avatars3.githubusercontent.com/u/14958992?s=400&v=4) <br> [Steve Carpenter](https://www.linkedin.com/in/carpentersteven/)
