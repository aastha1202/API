const express =require("express");
const router = express.Router();
const mongoose= require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const Todo= require("./todo")
const cors= require("cors")
const dayjs=require("dayjs")
const { DateTime } = require('luxon');


const corsOptions = {
  origin: 'https://todo-phi-jade.vercel.app',
};
app.use(bodyParser.json());

app.use(cors({
  origin: '*',
  methods: 'GET, POST, PUT, DELETE',
}));


const url= "mongodb+srv://admin_aastha:Test123@cluster0.edhnxlr.mongodb.net/todo"
// mongodb+srv://admin_aastha:<password>@cluster0.edhnxlr.mongodb.net/

mongoose.connect(url,{useNewUrlParser:true})

const con=mongoose.connection;
con.on('open',function(){
    console.log('connected')
})

router.post("/todo", async (req, res) => {
    const tasks = req.body.task;
    
    try {
      const savePromises = tasks.map(async (task) => {
        console.log(task.date)
        const formattedDate = dayjs(task.date, 'ddd MMM DD YYYY').format('YYYY-MM-DD');
        // const options = {
        //   weekday: 'long',
        //   day: 'numeric',
        //   month: 'long',
        //   year: 'numeric',
        // };
        // const formattedDate = new Intl.DateTimeFormat('en-US', options).format(task.date)
        console.log("formatted:",formattedDate)
        const todo = new Todo({ task:task.task , time:task.time,date:formattedDate});
        return await todo.save();
      });
  
      const savedTasks = await Promise.all(savePromises);
      res.send(savedTasks);
    } catch (err) {
      res.status(500).send(err);
    }
  });
  
 

  router.get("/todo", async (req, res) => {
    try {
      const today = DateTime.local().setZone('Asia/Kolkata').startOf('day');
  
      const todos = await Todo.find({
        date: {
          $gte: today.toJSDate(),
          $lt: today.plus({ days: 1 }).toJSDate()
        }
      });
  
      res.send(todos);
    } catch (err) {
      res.send(err);
    }
  });
  
  

// router.get("/todo", async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day

//     const todos = await Todo.find({
//         date: {
//             $gte: today,
//             $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Set the upper bound to the next day
//         }
//     });

//     res.send(todos);
// } catch (err) {
//     res.send(err);
// }
// });

router.get("/todo/user", async (req, res) => {
  try {
    const todos = await Todo.find();

    res.send(todos);
} catch (err) {
    res.send(err);
}
});



app.use("/", router);


let port = process.env.PORT;
if (port == null || port == "") {
  port = 9000;
}
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
