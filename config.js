/* Edit this file to configure the site. Everything here is public (it ships to the browser). */
window.APP_CONFIG = {
  /* OAuth 2.0 Client ID (Web application) from Google Cloud Console.
     Looks like: 1234567890-abc123.apps.googleusercontent.com
     A Client ID is public by design. Never put a client secret here. */
  googleClientId: "1076661932959-vn578ee8sjpbjshvqumels22l05mcgba.apps.googleusercontent.com",

  /* Web app URL of the Apps Script receiver (apps-script/Code.gs), ends with /exec.
     When set, answers are sent with one click and the Google Form fallback is not used. */
  submitUrl: "https://script.google.com/macros/s/AKfycbxInqjsxXKl8Lkr4jStxJUPi5quNlX6-oFjODOEHqBPqRnaUEGWWffdgIGhXos7geUcng/exec",

  /* Only Google accounts from this Workspace domain may continue. */
  allowedDomain: "p3md.sbm-itb.ac.id",

  /* Fallback only (used when submitUrl is empty): the Google Form that would
     receive the answers via a pre-filled link.
     publishedId: the /forms/d/e/<id>/viewform part of the form's share link.
     entries: 42 entry ids in form order: Nama, Grup, Elemen, Kelas,
     statements 1-27, soft skills S1-S10, then S11 (the checkbox question).
     Get them from "Get pre-filled link" (fill every question). Left empty
     because the form was rebuilt; the old ids no longer match. */
  form: {
    publishedId: "",
    entries: []
  }
};
