const router = require('express').Router();
const { Post, User, Vote } = require('../../models');
const sequelize = require('../../config/connection');

// In a query to the post table, we would like to retrieve not only information 
// about each post, but also the user that posted it. With the foreign key, user_id, 
// we can form a JOIN, an essential characteristic of the relational data model.

// // get all users
// router.get('/', (req, res) => {
//     console.log('======================');
//     Post.findAll({
//       // Query configuration
//       attributes: ['id', 'post_url', 'title', 'created_at'],

//     include: [
//         {
//           model: User,
//           attributes: ['username']
//         }
//       ]
//     })

//   });



// get all users
router.get('/', (req, res) => {
    Post.findAll({
        attributes: ['id', 'post_url', 'title', 'created_at'],
        order: [['created_at', 'DESC']],
        include: [
            {
                model: User,
                attributes: ['username']
            }
        ]
    })
        .then(dbPostData => res.json(dbPostData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

//single post request
router.get('/:id', (req, res) => {
    Post.findOne({
      where: {
        id: req.params.id
      },
      attributes: [
        'id',
        'post_url',
        'title',
        'created_at',
        [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
      ],
      include: [
        {
          model: User,
          attributes: ['username']
        }
      ]
    })
      .then(dbPostData => {
        if (!dbPostData) {
          res.status(404).json({ message: 'No post found with this id' });
          return;
        }
        res.json(dbPostData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });
  

router.post('/', (req, res) => {
    // expects {title: 'Taskmaster goes public!', post_url: 'https://taskmaster.com/press', user_id: 1}
    Post.create({
        title: req.body.title,
        post_url: req.body.post_url,
        user_id: req.body.user_id
    })
        .then(dbPostData => res.json(dbPostData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

// PUT /api/posts/upvote
// router.put('/upvote', (req, res) => {

//     Vote.create({
//         user_id: req.body.user_id,
//         post_id: req.body.post_id
//       }).then(() => {
//         // then find the post we just voted on
//         return Post.findOne({
//           where: {
//             id: req.body.post_id
//           },
//           attributes: [
//             'id',
//             'post_url',
//             'title',
//             'created_at',
//             // use raw MySQL aggregate function query to get a count of how many votes the post has and return it under the name `vote_count`
//             [
//               sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'),
//               'vote_count'
//             ]
//           ]
//         })
//         .then(dbPostData => res.json(dbPostData))
//         .catch(err => {
//           console.log(err);
//           res.status(400).json(err);
//         });
//     })
// })

router.put('/upvote', (req, res) => {
    // custom static method created in models/Post.js
    Post.upvote(req.body, { Vote })
      .then(updatedPostData => res.json(updatedPostData))
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  });
  
router.put('/:id', (req, res) => {
    Post.update(
        {
            title: req.body.title
        },
        {
            where: {
                id: req.params.id
            }
        }
    )
        .then(dbPostData => {
            if (!dbPostData) {
                res.status(404).json({ message: 'No post found with this id' });
                return;
            }
            res.json(dbPostData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.delete('/:id', (req, res) => {
    Post.destroy({
        where: {
            id: req.params.id
        }
    })
        .then(dbPostData => {
            if (!dbPostData) {
                res.status(404).json({ message: 'No post found with this id' });
                return;
            }
            res.json(dbPostData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

module.exports = router;