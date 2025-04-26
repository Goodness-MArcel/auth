import express from "express";
import AuthenticateToken from "../middleware/jwt.js";
import {
  signupPage,
  signuplogic,
  loginPage,
  loginlogic,
  dashboardPage,
  logOut,
  addTask,
  UserTaskPage,
  deleteAllUserTask,
  updateTask ,
  toggleTaskCompletion,
  deleteTask,
  calendarPage,
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  homePage
} from "./allroute.js";
const router = express.Router();
router.get(`/` , homePage)
router.get("/signup", signupPage);
router.post("/signup", signuplogic);
router.get("/login", loginPage);
router.post("/login", loginlogic);
router.get("/dashboard/:id", AuthenticateToken, dashboardPage);
router.get("/logout", logOut);

router.post("/task/add/:id", AuthenticateToken, addTask);
router.get("/task/user/:id", AuthenticateToken, UserTaskPage);
router.post("/delete/tasks/:id", deleteAllUserTask);
router.post('/task/update/:taskId/:userId', updateTask);
router.post('/task/delete/:taskId/:userId', deleteTask);
// Add this route to your main route file
router.post('/task/toggle/:taskId/:userId', toggleTaskCompletion);


// Calendar routes
router.get('/calendar/:id', calendarPage);
router.get('/events/:id', getEvents);
router.post('/event/add/:id', addEvent);
router.put('/event/update/:eventId/:id', updateEvent);
router.delete('/event/delete/:eventId/:id', deleteEvent);




export default router;
