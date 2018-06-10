# Drop The Ball

> Working parents are often balancing a number of responsibilities and can often feel guilt when they miss work deadlines due to family/social obligations. What if there were an app for working parents to delegate last minute tasks to folks in their microcommunities that would help them better lean on their ‘village’ while also disrupting the shame/guilt culture around care work. This disrupts the silos between the caring economy and gig economy by strengthening community bonds and interpersonal relationships through gamification.


# Routes

### Login

```
POST /login

{
  "email": "someone@example.website",
  "password": "HoPefuLLy_SecuRE!",
}
```


### Sign Up
```
POST /signup

{
  "email": "someone@example.website",
  "password": "HoPefuLLy_SecuRE!",
}
```

### Facebook Authentication

```
GET /auth/facebook
```

### Communities

_Create a community_
```
POST /communities

** Requires authentication **

{
  "name": "Your local church group",
  "description": "church stuffz",
  "location": "somewhereville, NA"
}
```

_Retrieve your communities_
```
GET /communities
```
