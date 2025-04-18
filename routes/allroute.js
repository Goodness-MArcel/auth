import sequelize from "../config/db.js";
import bcryt from "bcrypt";
import Account from "../models/User.js";
import Todo from "../models/Todo.js";
import jwt from "jsonwebtoken";

export const signupPage = async (req, res) => {
  res.render("signup", { title: "signup page" });
};

export const loginPage = async (req, res) => {
  res.render("login", { title: "login page" });
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
    console.log("account", account.name);
    res.render("dashboard", {
      title: "dashboard page",
      account: account,
    });
  } catch (error) {
    console.log("error fetching account ❌", error);
    return res.status(500).json({ message: "error fetching account ❌" });
  }
};
export const UserTaskPage = async (req, res) => {
    const UserId = req.params.id;
    try{
        const todo = await Todo.findAll({
            where: {
                accountId: UserId,
            }
        });
        console.log(todo);
        res.render("task", { title: "task page" , todos: todo });
    }catch(err){
        console.log("error fetching account ❌", err);
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
      return res.redirect("/");
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
    res.redirect("/login");
  });
};

export const addTask = async (req, res) => {
  const { taskTitle, taskDescription } = req.body;
  const accountId = req.params.id;
  try {
    const task = await Todo.create({
      title: taskTitle,
      description: taskDescription ,
      accountId: accountId,
    });
    console.log(task)
    req.flash("success_msg", "task added successfully ✅");
    res.redirect(`/dashboard/${accountId}`);
  } catch (error) {
    req.flash("error_msg", "error adding task ❌");
    console.log("error adding task ❌", error);
    return res.status(500).json({ message: "error adding task ❌" });
  }
};
