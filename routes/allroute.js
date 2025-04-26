import sequelize from "../config/db.js";
import bcryt from "bcryptjs";
import Account from "../models/User.js";
import Todo from "../models/Todo.js";
import Event from "../models/Event.js";
import { Op } from 'sequelize';

import Activity from "../models/Activity.js";
import jwt from "jsonwebtoken";

// Helper function to record user activity
const recordActivity = async (accountId, description) => {
  try {
    await Activity.create({
      accountId: accountId,
      description: description
    });
  } catch (error) {
    console.log("Error recording activity:", error);
  }
};
export const homePage = async (req, res) => {
  res.render("home", { title: "TaskMaster - Organize Your Life" });
};

export const signupPage = async (req, res) => {
  res.render("signup", { title: "signup" });
};

export const loginPage = async (req, res) => {
  res.render("login", { title: "login" });
};
export const dashboardPage = async (req, res) => {
  const UserId = req.params.id;
  console.log("user id", UserId);
  try {
    const account = await Account.findOne({
      where: {
        id: UserId,
      },
    });
    
    const totalTasks = await Todo.count({
      where: { accountId: UserId }
    });
    
    const completedTasks = await Todo.count({
      where: { 
        accountId: UserId,
        completed: true
      }
    });

    const pendingTasks = totalTasks - completedTasks

    // Fetch recent activities for this user
    const activities = await Activity.findAll({
      where: { accountId: UserId },
      order: [['timestamp', 'DESC']],
      limit: 5 // Get only the 5 most recent activities
    });
    
    // Format the timestamps for display
    const formattedActivities = activities.map(activity => {
      const now = new Date();
      const activityTime = new Date(activity.timestamp);
      const diffMs = now - activityTime;
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMs / 3600000);
      const diffDays = Math.round(diffMs / 86400000);
      
      let timeAgo;
      if (diffMins < 1) {
        timeAgo = 'Just now';
      } else if (diffMins < 60) {
        timeAgo = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else {
        timeAgo = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      }
      
      return {
        description: activity.description,
        timeAgo: timeAgo
      };
    });

    const upcomingEvents = await getUpcomingEvents(UserId);
    
    
    res.render("dashboard", {
      title: "dashboard page",
      account: account,
      activities: formattedActivities,
      taskStats: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks
      },
      upcomingEvents: upcomingEvents,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
    });
  } catch (error) {
    console.log("error fetching account ❌", error);
    return res.status(500).json({ message: "error fetching account ❌" });
  }
};


export const UserTaskPage = async (req, res) => {
  const UserId = req.params.id;
  const filter = req.query.filter;
  
  // Pagination parameters
  const page = parseInt(req.query.page) || 1; // Current page (default: 1)
  const limit = 5; // Items per page
  const offset = (page - 1) * limit; // Offset for SQL query
  
  try {
    let whereClause = { accountId: UserId };
    
    // Apply filter if specified
    if (filter === 'pending') {
      whereClause.completed = false;
    } else if (filter === 'completed') {
      whereClause.completed = true;
    }
    
    // Get total count for pagination
    const totalCount = await Todo.count({
      where: whereClause
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);
    
    // Get paginated tasks
    const todos = await Todo.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']], // Show newest tasks first
      limit: limit,
      offset: offset
    });
    
    res.render("task", {
      title: "task page",
      todos: todos,
      UserId: UserId,
      filter: filter,
      pagination: {
        page: page,
        limit: limit,
        totalItems: totalCount,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg")
    });
  } catch (err) {
    console.log("error fetching tasks ❌", err);
    req.flash("error_msg", "Error fetching tasks");
    res.redirect(`/dashboard/${UserId}`);
  }
};


export const addTask = async (req, res) => {
  const { taskTitle, taskDescription } = req.body;
  const accountId = req.params.id;
  try {
    const task = await Todo.create({
      title: taskTitle,
      description: taskDescription,
      accountId: accountId,
    });
    
    // Record this activity
    await recordActivity(accountId, `Added new task: ${taskTitle}`);
    
    req.flash("success_msg", "task added successfully ✅");
    res.redirect(`/task/user/${accountId}`);
  } catch (error) {
    req.flash("error_msg", "error adding task ❌");
    console.log("error adding task ❌", error);
    return res.status(500).json({ message: "error adding task ❌" });
  }
};

export const deleteAllUserTask = async (req, res) => {
  const UserId = req.params.id;
  try {
    await Todo.destroy({
      where: {
        accountId: UserId,
      },
    });
    
    // Record this activity
    await recordActivity(UserId, "Deleted all tasks");
    
    req.flash("success_msg", "All tasks has been deleted successfully");
    res.redirect(`/task/user/${UserId}`);
  } catch (err) {
    req.flash("error_msg", "error deleting all tasks");
    res.redirect(`/task/user/${UserId}`);
  }
};

export const signuplogic = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcryt.hash(password, 10);
  try {
    const existingAccount = await Account.findOne({ where: { email: email } });
    if (existingAccount) {
      req.flash("error_msg", "account already exists ❌");
      console.log("account already exists ❌");
      return res.redirect("/signup");
    }
    const account = await Account.create({
      name: name,
      email: email,
      password: hashedPassword,
    });
    req.flash("success_msg", "account created successfully ✅");
    console.log("account created successfully ✅", account);
    res.redirect("/login");
  } catch (error) {
    console.log("error creating account ❌", error);
    return res.status(500).json({ message: "error creating account ❌" });
  }
};

export const loginlogic = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingAccount = await Account.findOne({ where: { email: email } });
    if (!existingAccount) {
      req.flash("error_msg", "account does not exist ❌");
      return res.redirect("/login");
    }
    const isMatch = await bcryt.compare(password, existingAccount.password);
    if (!isMatch) {
      req.flash("error_msg", "invalid credentials ❌");
      return res.redirect("/login");
    }
    const token = jwt.sign({ id: existingAccount.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    existingAccount.token = token;

    res.cookie("auth_token", token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour in milliseconds
    });
    req.flash("success_msg", "logged in successfully ✅");
    console.log(existingAccount);
    res.redirect(`/dashboard/${existingAccount.id}`);
  } catch (error) {
    req.flash("error_msg", "error logging in");
    console.log(error);
    return res.status(500).json({ message: "error logging in ❌" });
  }
};

export const logOut = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      req.flash("error_msg", "error logging out ❌");
      return res.redirect("/dashboard");
    }
    res.clearCookie("auth_token");
    // req.flash('success_msg', 'logged out successfully ✅');
    res.redirect("/");
  });
};

export const updateTask = async (req, res) => {
  const taskId = req.params.taskId;
  const UserId = req.params.userId;
  const { taskTitle, taskDescription } = req.body;
  
  try {
    const task = await Todo.findByPk(taskId);
    
    if (!task) {
      req.flash("error_msg", "Task not found");
      return res.redirect(`/task/user/${UserId}`);
    }
    
    // Update the task
    await task.update({
      title: taskTitle,
      description: taskDescription
    });
    
    // Record this activity
    await recordActivity(UserId, `Updated task: ${taskTitle}`);
    
    req.flash("success_msg", "Task updated successfully");
    return res.redirect(`/task/user/${UserId}`);
  } catch (error) {
    console.log("Error updating task ❌", error);
    req.flash("error_msg", "Error updating task");
    return res.redirect(`/task/user/${UserId}`);
  }
};


// Delete a specific task
export const deleteTask = async (req, res) => {
  const taskId = req.params.taskId;
  const UserId = req.params.userId;
  
  try {
    const task = await Todo.findByPk(taskId);
    
    if (!task) {
      req.flash("error_msg", "Task not found");
      return res.redirect(`/task/user/${UserId}`);
    }
    
    const taskTitle = task.title;
    
    // Delete the task
    await task.destroy();
    
    // Record this activity
    await recordActivity(UserId, `Deleted task: ${taskTitle}`);
    
    req.flash("success_msg", "Task deleted successfully");
    return res.redirect(`/task/user/${UserId}`);
  } catch (error) {
    console.log("Error deleting task ❌", error);
    req.flash("error_msg", "Error deleting task");
    return res.redirect(`/task/user/${UserId}`);
  }
};


// Toggle task completion status
export const toggleTaskCompletion = async (req, res) => {
  const taskId = req.params.taskId;
  const UserId = req.params.userId;
  
  try {
    const task = await Todo.findByPk(taskId);
    
    if (!task) {
      req.flash("error_msg", "Task not found");
      return res.redirect(`/task/user/${UserId}`);
    }
    
    // Toggle the completed status
    const newStatus = !task.completed;
    await task.update({ completed: newStatus });
    
    // Record this activity
    const statusText = newStatus ? "completed" : "reopened";
    await recordActivity(UserId, `Marked task as ${statusText}: ${task.title}`);
    
    req.flash("success_msg", `Task marked as ${statusText}`);
    return res.redirect(`/task/user/${UserId}`);
  } catch (error) {
    console.log("Error updating task completion status ❌", error);
    req.flash("error_msg", "Error updating task status");
    return res.redirect(`/task/user/${UserId}`);
  }
};


// Calendar page
export const calendarPage = async (req, res) => {
  const UserId = req.params.id;
  try {
    const account = await Account.findOne({
      where: {
        id: UserId,
      },
    });
    
    if (!account) {
      req.flash("error_msg", "Account not found");
      return res.redirect("/login");
    }
    
    res.render("calendar", {
      title: "Calendar",
      account: account,
      UserId: UserId,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg")
    });
  } catch (error) {
    console.log("Error fetching account ❌", error);
    req.flash("error_msg", "Error loading calendar");
    return res.redirect(`/dashboard/${UserId}`);
  }
};

// API to get events
export const getEvents = async (req, res) => {
  const UserId = req.params.id;
  const start = new Date(req.query.start);
  const end = new Date(req.query.end);
  
  try {
    const events = await Event.findAll({
      where: {
        accountId: UserId,
        start: {
          [Op.gte]: start
        },
        end: {
          [Op.lte]: end
        }
      }
    });
    
    // Format events for FullCalendar
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      color: event.color,
      extendedProps: {
        description: event.description
      }
    }));
    
    res.json(formattedEvents);
  } catch (error) {
    console.log("Error fetching events ❌", error);
    res.status(500).json({ error: "Error fetching events" });
  }
};

// Add a new event
export const addEvent = async (req, res) => {
  const UserId = req.params.id;
  const { title, description, start, end, allDay, color } = req.body;
  
  try {
    const event = await Event.create({
      title,
      description,
      start: new Date(start),
      end: new Date(end),
      allDay: allDay === 'true',
      color: color || '#3788d8',
      accountId: UserId
    });
    
    // Record activity
    await recordActivity(UserId, `Added new event: ${title}`);
    
    req.flash("success_msg", "Event added successfully");
    res.redirect(`/calendar/${UserId}`);
  } catch (error) {
    console.log("Error adding event ❌", error);
    req.flash("error_msg", "Error adding event");
    res.redirect(`/calendar/${UserId}`);
  }
};

// Update an event
export const updateEvent = async (req, res) => {
  const eventId = req.params.eventId;
  const UserId = req.params.id;
  const { title, description, start, end, allDay, color } = req.body;
  
  try {
    const event = await Event.findOne({
      where: {
        id: eventId,
        accountId: UserId
      }
    });
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    await event.update({
      title,
      description,
      start: new Date(start),
      end: new Date(end),
      allDay: allDay === 'true',
      color: color || '#3788d8'
    });
    
    // Record activity
    await recordActivity(UserId, `Updated event: ${title}`);
    
    res.json({ success: true });
  } catch (error) {
    console.log("Error updating event ❌", error);
    res.status(500).json({ error: "Error updating event" });
  }
};

// Delete an event
export const deleteEvent = async (req, res) => {
  const eventId = req.params.eventId;
  const UserId = req.params.id;
  
  try {
    const event = await Event.findOne({
      where: {
        id: eventId,
        accountId: UserId
      }
    });
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    const eventTitle = event.title;
    await event.destroy();
    
    // Record activity
    await recordActivity(UserId, `Deleted event: ${eventTitle}`);
    
    res.json({ success: true });
  } catch (error) {
    console.log("Error deleting event ❌", error);
    res.status(500).json({ error: "Error deleting event" });
  }
};

// Get upcoming events for dashboard
export const getUpcomingEvents = async (userId) => {
  const now = new Date();
  const oneWeekLater = new Date();
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);
  
  try {
    const events = await Event.findAll({
      where: {
        accountId: userId,
        start: {
          [Op.gte]: now,
          [Op.lt]: oneWeekLater
        }
      },
      order: [['start', 'ASC']],
      limit: 5
    });
    
    return events;
  } catch (error) {
    console.log("Error fetching upcoming events ❌", error);
    return [];
  }
};