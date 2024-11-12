## How to deploy it?

1. First register to Resend and get an API key. You can get up and running in no time [HERE](https://resend.com/docs/send-with-nodejs).
2. Register to Google Developers Console and get a client id and client secret, you can follow [THIS](https://support.google.com/cloud/answer/6158849?hl=en) guide.
3. Generate the refresh token [HERE](https://developers.google.com/oauthplayground/). 
On the top right you can set your client id and also client secret from the second step


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/iw4ju28oyxxix09kgxsu.png)


And you must set the calendar.readonly right on the left and you can generate your tokens


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/igcbu63p4ebxnvwqet6s.png)


5. Now we have all the data that can be inserted into our wrangler.toml
6. Pull the project from the [Github repo](https://github.com/Gyurmatag/calendar-workflow).
7. Run `npm install` on route.
8. Follow [THIS](https://developers.cloudflare.com/workers/get-started/guide/) guide to deploy it to Cloudflare. You can skip the first step, because we already have a project.
