const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((customer) => customer.username === username);

  if (!user) return response.status(404).json({ error: "User not found" });

  request.username = username;

  return next();
}

function findUserByUsername(username) {
  return users.find((user) => user.username === username);
}

app.post("/users", (request, response) => {
  const id = uuidv4();
  const { name, username } = request.body;

  const userAlreadyExists = findUserByUsername(username);

  if (userAlreadyExists)
    return response.status(400).json({ error: "User already exists" });

  const user = {
    id,
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const user = findUserByUsername(username);

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const todoId = uuidv4();

  const user = findUserByUsername(username);

  const newTodo = {
    id: todoId,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const user = findUserByUsername(username);
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found" });

  todo.title = title;
  todo.deadline = deadline;

  return response.status(200).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = findUserByUsername(username);
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found" });

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = findUserByUsername(username);
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found" });

  user.todos.splice(todo, 1);

  return response.status(204).json(todo);
});

module.exports = app;
