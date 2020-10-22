const express = require("express"); // move this into server eventually
// const { database } = require('pg/lib/defaults');

const router = express.Router(); // move this into server enentually and pass as an argument
const cookieSession = require("cookie-session");
const { branchFilterAndSort, populateKeywordArray } = require("../helpers");
router.use(
  cookieSession({
    name: "session",
    keys: [
      "this is a very good key thank you",
      "nfjklasdfiasjudpfnonfniju2o3r94ruj123mn45rji42bn580423jnro",
    ],
  })
);

module.exports = (database) => {
  // get all stories
  router.get("/", (req, res) => {
    console.log("Search: ", req.query);
    database
      // .getAllStories({ user_name: null, search: null }) // original working code
      .getAllStories(req.query) // changed - should be fine
      .then((stories) => {
        if (!stories) {
          res.send({ error: "empty library" });
        } else {
          res.send(stories);
        }
      })
      .catch((error) => res.send(error.message));
  });

  // post a new story
  router.post("/", (req, res) => {
    // console.log(req.body);
    // console.log(req.session);
    const story = req.body;

    story['user_id'] = req.session['user_id'];
    database.addStory(story)
    .then((data) => {
      // console.log(data);
      res.send(data);
    });
  });

  // gets stories by a specific user id
  // router.get('/:userId', (req, res) => {
  //   database.getUsernameFromUserId(req.params.userId)
  //   .then(data => {
  //     database.getAllStories({user_name: data.name, search: null})
  //     .then(stories => {
  //       if(!stories) {
  //         res.send({error: 'empty library'});
  //       } else {
  //         res.send(stories)
  //       }

  //     })
  //     .catch((error) => res.send(error.message));
  // });

  // gets story + branch and keyword info by id
  router.get("/:storyId", (req, res) => {
    console.log(req.session['user_id']);
    //the first function call returns the stories object from the stories relation
    database
      .getStoryById(req.params.storyId)
      .then((story) => {
        if (story.length < 1) {
          res.send({ error: "empty library" });
        } else {
          //the second function call queries favourites in the db and appends the count of favourites to the stories object
          database.getFaveCountByStoryId(req.params.storyId).then((faves) => {
            story[0].times_favourited = faves[0].times_favourited;
            //the third function call queries story_keywords and populates an array of keywords in the stories object
            database
              .getKeywordsByStoryId(req.params.storyId)
              .then((keywords) => {
                story[0].keywords = [];
                for (let entry of keywords) {
                  story[0].keywords.push(entry.keywords);
                }
                database
                  .getBranchesByStoryId(req.params.storyId)
                  .then((branches) => {
                    // branchFilterAndSort is defined in helpers.js on the server side
                    let approvedBranches = branchFilterAndSort(branches);
                    story[0].branches = approvedBranches;
                    res.send(story);
                  });
              });
          });
        }
      })
      .catch((error) => console.error(error.message));
  });

  router.post('/branches', (req, res) => {

    const branch = req.body;
    if(!req.session['user_id']) {
      res.send({error: 'Please login to add branches.'});
    } else {
      branch['user_id'] = req.session['user_id'];
      // console.log('branch: ', branch);
      // console.log(branch)
      database.getBranchPointFromStoryPage(branch)
      .then(data => {
        branch.lastBranchPoint = data.id;
        console.log('branch: ', branch)
        database
        .addBranch(branch)
        .then((data) => {
          database.getUsernameFromUserId(data.user_id)
          .then((username) => {
            data.name = username.name;
            console.log('data being sent: ', data);
            res.send(data);
          })
        })
      })
      .catch(error => console.log(error.message));
    }
  })
  // module.exports = (database) => {

  router.get("/branches/:branch_point_id", (req, res) => {
    console.log(req.params)
    database
      .getBranchesByBranchPointId(req.params.branch_point_id)
      .then((branches) => {
      //   if (branches.length < 1) {
      //     res.send({ error: "empty library" });
      //   } else {
      //     console.log('branches from branch point: ', branches);
      //     res.send(branches);
      //   }
      // })
      // console.log(branches[0].story_id)
      database.getUserIdByStoryId(branches[0].story_id)
      .then((data) => {
        // console.log(data.id)
        // we can compare that user id to cookie id
        if (branches.length < 1) {
          res.send({ error: "empty library" });
        } else {
          for (const branch of branches) {
            if (data.id === req.session.user_id) {
              branch['owner'] = true;
            } else {
              branch['owner'] = false;
            }
          }
          // console.log(branches);
          res.send(branches);
        }
      })
      // if user.id = cookie id then add key owner is true, else false


      })


      .catch((error) => res.send(error.message));
  });

  router.put("/branches", (req, res) => {
    console.log(req.body)

    database
      .updateBranch(req.body.branchId)
      .then((data) => {
        console.log("approved" ,data)
      })
      .catch(error => console.log(error));
  })

  router.post('/branches/votes', (req, res) => {
    const vote = req.body;
    if(!req.session['user_id']) {
      res.send({error: 'Please login to vote.'});
    } else {
      vote['user_id'] = req.session['user_id'];
      console.log(vote);
      database
      .checkVote(vote)
      .then((data) => {
        console.log('vote status: ', data);
        // if (data) {
        //   if (data.up) {
        //     unvote
        //   } else {
        //     revote
        //   }
        // } else {
        //   addvote
        // }
        if(data) {
          if(data.up) {
            database
            .unvote(vote)
            .then((data) => {
            console.log('unvote vote:', data)
            })
          } else if(data.up === null) {
            database
            .reVote(vote)
            .then((data) => {
            console.log('up vote:', data)
            })
          }
        } else {
          database
          .addVote(vote)
          .then((data) => {
            console.log('add vote:', data)
          })
        }
      })
      .catch(error => console.log(error));

    }
  })

  return router;
};

