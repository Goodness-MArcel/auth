# TaskMaster - Organize Your Life

TaskMaster is a comprehensive task and event management application designed to help users organize their daily activities, track tasks, and manage their calendar events efficiently.

## Features

### User Authentication
- Secure signup and login system
- Password encryption using bcrypt
- JWT-based authentication
- Session management

### Dashboard
- Overview of task statistics (total, completed, pending)
- Recent user activities log
- Upcoming events preview

### Task Management
- Create, read, update, and delete tasks
- Mark tasks as completed/pending
- Filter tasks by status (all, pending, completed)
- Pagination for better task navigation
- Bulk delete option for all tasks

### Calendar & Event Management
- Interactive calendar interface
- Create, update, and delete events
- Color-coding for different event types
- Event details including title, description, start/end times
- All-day event support

### Activity Tracking
- Automatic logging of user actions
- Timestamp with relative time display (e.g., "2 hours ago")
- Activity history for user reference

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: SQL database with Sequelize ORM
- **Frontend**: EJS templating engine
- **Authentication**: JWT, bcrypt
- **UI Components**: Likely Bootstrap or similar CSS framework
- **Calendar**: FullCalendar integration

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Goodness-MArcel/auth.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in a `.env` file:
```
JWT_SECRET=your_jwt_secret
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
```

4. Run database migrations (if applicable)

5. Start the application:
```bash
npm start
```

## Usage

1. Register a new account on the signup page
2. Log in with your credentials
3. Use the dashboard to get an overview of your tasks and upcoming events
4. Navigate to the Tasks page to manage your to-do items
5. Use the Calendar page to schedule and manage events

## Project Structure

- **models/**: Database models (User, Todo, Event, Activity)
- **routes/**: Application routes and controller logic
- **config/**: Configuration files including database setup
- **views/**: EJS templates for rendering pages
- **public/**: Static assets (CSS, JavaScript, images)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Express.js](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [FullCalendar](https://fullcalendar.io/)
- [bcrypt.js](https://github.com/dcodeIO/bcrypt.js/)
- [JSON Web Token](https://jwt.io/)
