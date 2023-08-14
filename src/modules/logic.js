class Project
{
    constructor(title)
    {
        this.title = title;
        this.tasks = [];
    }
};

class Task
{
    constructor(title,description,dueDate,priority,notes,tag,status)
    {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.notes = notes;
        this.tag = tag;
        this.status = status;
    }
};

export 
{
    Project,
    Task
}
