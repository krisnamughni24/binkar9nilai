/* Edit this file to configure the site. Everything here is public (it ships to the browser). */
window.APP_CONFIG = {
  /* OAuth 2.0 Client ID (Web application) from Google Cloud Console.
     Looks like: 1234567890-abc123.apps.googleusercontent.com
     A Client ID is public by design. Never put a client secret here. */
  googleClientId: "1076661932959-vn578ee8sjpbjshvqumels22l05mcgba.apps.googleusercontent.com",

  /* Only Google accounts from this Workspace domain may continue. */
  allowedDomain: "p3md.sbm-itb.ac.id",

  /* Google Form that stores the answers.
     publishedId: the /forms/d/e/<id>/viewform part of the form's share link.
     entries: 75 entry ids in form order: Nama, Grup, Elemen, Kelas,
     the 9 Bagian A items, then the 62 Bagian B items.
     Get them again from "Get pre-filled link" if the form's questions change. */
  form: {
    publishedId: "1FAIpQLScdskglzlLyKO6YBAL-0JTkb-nPjkW37YBaOPOmoJ4Ukj7zFQ",
    entries: ["1039629005","1787668882","1722170883","1819435392","932754189","555888684","2115312267","1880128029","401441312","952739267","1507930409","592113071","110764404","222444456","1226972216","1971008868","2113397856","460407317","27377639","1142242704","1211934679","1684624795","507033336","238388817","1447062646","522939261","48447210","1512283159","1660231370","1206405199","1039299921","1122154892","271017516","1367205110","828778177","528485976","1978421208","1352635347","843810","1183186909","1575404880","1357234872","354900590","2143801268","2071592479","175200376","484754060","262563973","1713706889","1370948429","1076351373","996541892","1313868420","369874532","945553843","800528635","1306478225","2127012016","2096155728","1286803553","1049513305","279596351","740861380","1471111764","1837034101","1168007288","1488058484","1884827914","1209462455","1657223488","428759891","623131387","969591132","984442434","1316072824"]
  }
};
