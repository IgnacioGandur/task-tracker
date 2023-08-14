import flatpickr from 'flatpickr';
import './css/styles.css';
import completed from './images/complete.gif';
import deleteImage from './images/delete.gif';
import emptyPageDark from './images/empty-dark.svg';
import emptyPageLight from './images/empty-light.svg';
import highPriority from './images/high-priority.gif';
import incomplete from './images/incomplete.gif';
import lowPriority from './images/low-priority.gif';
import mediumPriority from './images/medium-priority.gif';
import { Project, Task } from './modules/logic';
import sanitizeHtml from 'sanitize-html';

//                                  Theme color section, start.
//                                  Function to set a given theme/color-scheme.
function setTheme(themeName)
{
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
    loadEmptyImage();
    if(document.querySelector('.theme-light'))
    {
        document.querySelector('[data-calendar-theme]').setAttribute('href', 'https://npmcdn.com/flatpickr/dist/themes/light.css');
    }
    else
    {
        document.querySelector('[data-calendar-theme]').setAttribute('href', 'https://npmcdn.com/flatpickr/dist/themes/dark.css');
    }
}
//                                  Function to toggle between light and dark theme.
function toggleTheme()
{
    if (localStorage.getItem('theme') === 'theme-dark')
    {
        setTheme('theme-light');
    }
    else
    {
        setTheme('theme-dark');
    }
}
//                                      Set the theme on initial load.
(function()
{
    if (localStorage.getItem('theme')==='theme-dark')
    {
        setTheme('theme-dark');
    }
    else
    {
        setTheme('theme-light');
    }
})();
window.toggleTheme = toggleTheme;
//                                      Theme color section, end.
//                                      Call functions of page load.
window.onload = function()
{
    showDate();
    flatpickr('input[type=datetime-local]', 
    {
        enableTime:true,
        dateFormat: 'l, J/F/Y, at G:i K.',
        allowInput: true,
    });
    renderProjects();
    loadEmptyImage();
}
//                              Add background image section to main section if no projects are selected.
function loadEmptyImage()
{
    if (!document.querySelector('[data-section="empty-section"]'))
    {
        return;
    }
    else
    {
        let emptySection = document.querySelector('[data-section="empty-section"]');
        emptySection.innerHTML = '';
        let image = document.createElement('img');
        image.src = document.querySelector('.theme-light') ? emptyPageLight : emptyPageDark;
        emptySection.appendChild(image);
    }
};

//                              Set today's date in left bottom section.
function showDate()
{
    let date = flatpickr.formatDate(new Date(), 'l, J/F/Y.')
    document.querySelector('[data-today-date]').innerHTML = `Date: ${date}`;
}

//                                      Create local storage if possible.
let userProjects = localStorage.getItem('UserProjects') ? JSON.parse(localStorage.getItem('UserProjects')) : [];

//                                      Adding event listener to the "create a new project" button.
document.querySelector('[data-create-project]').addEventListener('click', ()=>
{
    createProject();
    renderProjects();
    MF_.checkActiveTab(document.querySelector('.tasks-container').getAttribute('data-section'));
});

//                                      Sanitize inputs, prevent the user from entering html tags as inputs.
function sanitizeInputs(input)
{
    const options = 
    {
        allowedTags: [],
        allowedAttributes: [],
        disallowedTagsMode: 'escape',
    }
    return sanitizeHtml(input, options)
};

//                                      Create project.
function createProject()
{
    let projectTitle = document.querySelector('#project-title').value;
    if (projectTitle === '')
    {
        alert('The project name can\'t be empty.');
        return;
    }
    else if (isProjectInArray(userProjects, projectTitle))
    {
        alert('A project with that name already exists. Choose another name.')
        return;
    }
    else
    {
        let newProject = new Project(projectTitle);
        userProjects.push(newProject);
        localStorage.setItem('UserProjects', JSON.stringify(userProjects));
        document.querySelector('#project-title').value = '';
    }
//                                  Check if a project already exists to prevent duplication.
    function isProjectInArray(array, targetTitle)
    {
        return array.some(obj => obj.title === targetTitle);
    }
}
//                                      Render user projects.
function renderProjects()
{
    let projectsContainer = document.querySelector('[data-user-projects-container]');
    projectsContainer.innerHTML = '';
    for (let i = 0; i < userProjects.length; i++)
    {
        let currentProject = userProjects[i];
        let project = document.createElement('div');
        project.classList.add('project');
        project.setAttribute('data-project', `${i}`);
        project.setAttribute('data-project-name', `${currentProject.title}`)
        project.setAttribute('onclick', `MF_.createSection(${i}); MF_.checkActiveTab('${currentProject.title}'); MF_.renderTasks(${i})`)
        project.innerHTML = `
            <div class="title">
                <p>${sanitizeInputs(currentProject.title)}</p>
                <div class="icons">
                    <span onclick="event.stopPropagation(); MF_.showEditProjectSection(${i})" class="material-icons-round">edit</span>
                    <span onclick="event.stopPropagation(); MF_.deleteProject(${i})" class="material-icons-round">delete_forever</span>
                </div>
            </div>
            <div class="edit-title" data-edit-project-title="${i}" style="display:none;">
                <input onclick="event.stopPropagation();" type="text" placeholder="Enter new project title." maxlength="25" id="new-title-${i}" value="${currentProject.title}">
                <button onclick="event.stopPropagation(); MF_.saveEditProjectTitle(${i})">Change title</button>
                <button onclick="event.stopPropagation(); MF_.hideEditProjectSection(${i})">Cancel edit</button>
            </div>
        `;
        projectsContainer.appendChild(project);
    }
};

//                                      Creating the tasks when the "Create task" button is clicked.
document.querySelector('[data-create-task]').addEventListener('submit', (e)=>
{
    e.preventDefault();
    if (!document.querySelector('.active'))
    {
        alert('Select a project before creating a task.')
        return;
    }
    else
    {
        createTask();
        clearTaskInputs();
    }
});

function createTask()
{
    let title = document.querySelector('#task-title').value;
    let description = document.querySelector('#task-description').value;
    let dueDate = document.querySelector('#task-due-date').value;
    let priority = document.querySelector('#task-priority').value;
    let notes = document.querySelector('#task-notes').value;
    let tag = document.querySelector('input[name=tag]:checked').value;
    let status = document.querySelector('#check-5').checked;
    let newTask = new Task(title,description,dueDate,priority,notes,tag,status);

//                                  Deciding in which project the task is going to be appended.
    let index = document.querySelector('.active').getAttribute('data-project');
    userProjects[index].tasks.push(newTask);
    localStorage.setItem('UserProjects', JSON.stringify(userProjects));
    MF_.renderTasks(index);
}

//                                  Change the user icon color on click.
document.querySelector('[data-user-color]').addEventListener('click', function (){
    let color = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
    this.style.color = color;
    localStorage.setItem('UserColor', color);
});

//                                  Check if the user has local storage for the user color.
(function ()
{
    if (!localStorage.getItem('UserColor'))
    {
        return;
    }
    else
    {
        document.querySelector('[data-user-color]').style.color = localStorage.getItem('UserColor');
    }
})();

//                                  Show section to allow the user to change the name.
document.querySelector('[data-edit-user-name]').addEventListener('click', function(){
    document.querySelector('[data-edit-name-section]').style.display = 'flex';
});
//                                  Hide section when user cancels the changing of the user name.
document.querySelector('[data-hide-edit-user-name]').addEventListener('click', ()=>
{
    document.querySelector('[data-edit-name-section]').style.display = 'none';
});
//                                  Save the user name change.
document.querySelector('[data-change-user-name-button]').addEventListener('click', ()=>
{
    let newName = document.querySelector('#new-user-name').value;
    if (newName === '')
    {
        alert('The new user name can\' be empty.')
        return;
    }
    else
    {
        document.querySelector('[data-user-name]').innerHTML = sanitizeInputs(newName);
        document.querySelector('[data-user-name-projects]').innerHTML = sanitizeInputs(newName);
        document.querySelector('#new-user-name').value = '';
        document.querySelector('[data-edit-name-section]').style.display = 'none';
        localStorage.setItem('UserName', newName);
    }   
});
//                                  Check if local storage has user name
(function ()
{
    if (!localStorage.getItem('UserName'))
    {
        return;
    }
    else
    {
        document.querySelector('[data-user-name]').innerHTML = localStorage.getItem('UserName');
        document.querySelector('[data-user-name-projects]').innerHTML =localStorage.getItem('UserName');
    }
})();

function clearTaskInputs()
{
    let title = document.querySelector('#task-title').value = '';
    let description = document.querySelector('#task-description').value = '';
    let dueDate = document.querySelector('#task-due-date').value = '';
    let priority = document.querySelector('#task-priority').value = '';
    let notes = document.querySelector('#task-notes').value = '';
    let tag = document.querySelector('input[name=tag]:checked').checked = false;
    let status = document.querySelector('#check-5').checked = false;
}

const MF_ = 
{
    showEditProjectSection(index)
    {
        
        document.querySelector(`[data-edit-project-title="${index}"]`).style.display = 'flex';
    },
    hideEditProjectSection(index)
    {
        document.querySelector(`[data-edit-project-title="${index}"]`).style.display = 'none';
    },
    saveEditProjectTitle(index)
    {
        let newTitle = document.querySelector(`#new-title-${index}`).value;
        if (newTitle === '')
        {
            alert('The new title can\' be empty.')
            return;
        }
        else if (isProjectInArray(userProjects, newTitle))
        {
            alert('There is another project with that name already. Choose another name.')
            return;
        }
        else
        {
            userProjects[index].title = newTitle;
            localStorage.setItem('UserProjects', JSON.stringify(userProjects));
            renderProjects();
            this.createSection(index);
            this.renderTasks(index);
            this.checkActiveTab(userProjects[index].title);
        }
        function isProjectInArray(array, targetTitle)
        {
            return array.some(obj => obj.title === targetTitle);
        }
    },
    deleteProject(index)
    {
        if (document.querySelector(`[data-project-name='${userProjects[index].title}']`).matches('.active'));
        {
            document.querySelector('main#main').innerHTML = `
            <div class="project-header">
                <h3 data-title>Select or create a project.</h3>
            </div>
            <div class="tasks-container" data-tasks-container data-section="empty-section">
            </div>
            `;
        }
        userProjects.splice(index, 1);
        localStorage.setItem('UserProjects', JSON.stringify(userProjects));
        renderProjects();
        loadEmptyImage();
    },
    createSection(index)
    {
        let main = document.querySelector('main#main');
        main.innerHTML = `
        <div class="project-header">
            <h3 data-title>${sanitizeInputs(userProjects[index].title)}</h3>
        </div>
        <div class="tasks-container" data-tasks-container data-section="${userProjects[index].title}">
        </div>
        `;
        // document.querySelector('[data-title]').innerHTML = `${userProjects[index].title}`;
        // document.querySelector('[data-tasks-container]').innerHTML = `
        //     <div data-section="${userProjects[index].title}" class="tasks-container">
        //     </div>
        // `;
    },
    checkActiveTab(projectTitle)
    {
        let allProjects = document.querySelectorAll('[data-project]');
        for (let i = 0; i < allProjects.length; i++)
        {
            let currentProject = allProjects[i];
            if (currentProject.getAttribute('data-project-name') === projectTitle && document.querySelector(`[data-section="${projectTitle}"]`))
            {
                currentProject.classList.add('active');
            }
            else
            {
                currentProject.classList.remove('active');
            }
        }
    },
    renderTasks(index)
    {
        // if(userProjects[index].tasks.length === 0)
        // {
        //     // Add image/illustration in the tasks container if no tasks are found.
        //     // alert('There are no tasks here.')
        //     return;
        // }
        // else
        // {
            let tasksContainer = document.querySelector('[data-tasks-container]');
            tasksContainer.innerHTML = '';
            for (let i = 0; i < userProjects[index].tasks.length; i++)
            {
                let currentTask = userProjects[index].tasks[i];
                let card = document.createElement('div');
                card.classList.add('card');
                card.innerHTML = `
                    <div class="paragraphs-line">
                        <div class="title">
                            <div class="visible">
                                <p><strong>Title - </strong>${sanitizeInputs(currentTask.title)}</p>
                                <span class="material-icons-round" onclick="MF_.showEditTaskSection('title', ${i})">edit</span>
                            </div>
                            <div class="invisible" style="display:none;" data-edit-task-title-${i}>
                                <input type="text" value="${currentTask.title}" id="new-task-title-${i}" maxlength="25"                                              >
                                <button onclick="MF_.saveEditedTaskProperty('title', ${i})">Save edit</button>
                                <button onclick="MF_.hideEditTaskSection('title',${i})">Cancel edit</button>
                            </div>
                        </div>
                        <div class="due-date">
                            <div class="visible">
                                <p><strong>Due Date - </strong>${sanitizeInputs(currentTask.dueDate)}</p>
                                <span class="material-icons-round" onclick="MF_.showEditTaskSection('due-date',${i})">edit</span>
                            </div>
                            <div class="invisible" style="display:none;" data-edit-task-due-date-${i}>
                                <input type="datetime-local" id="new-task-dueDate-${i}" placeholder="Click to edit the date.">
                                <button onclick="MF_.saveEditedTaskProperty('dueDate',${i})">Save edit</button>
                                <button onclick="MF_.hideEditTaskSection('due-date', ${i})">Cancel edit</button>
                            </div>
                        </div>
                        <div class="description">
                            <div class="visible">
                                <p><strong>Description - </strong>${sanitizeInputs(currentTask.description)}</p>
                                <span class="material-icons-round" onclick="MF_.showEditTaskSection('description',${i})">edit</span>
                            </div>
                            <div class="invisible" style="display:none;" data-edit-task-description-${i}>
                                <input type="text" id="new-task-description-${i}" value="${currentTask.description}">
                                <button onclick="MF_.saveEditedTaskProperty('description',${i})">Save edit</button>
                                <button onclick="MF_.hideEditTaskSection('description',${i})">Cancel edit</button>
                            </div>
                        </div>
                        <div class="notes">
                            <div class="visible">
                                <p><strong>Notes - </strong>${sanitizeInputs(currentTask.notes)}</p>
                                <span class="material-icons-round" onclick="MF_.showEditTaskSection('notes',${i})">edit</span>
                            </div>
                            <div class="invisible" style="display:none;" data-edit-task-notes-${i}>
                                <input type="text" id="new-task-notes-${i}" value="${currentTask.notes}">
                                <button onclick="MF_.saveEditedTaskProperty('notes',${i})">Save edit</button>
                                <button onclick="MF_.hideEditTaskSection('notes',${i})">Cancel edit</button>
                            </div>
                        </div>
                    </div>
                    <div class="icons-line">
                        <div class="priority" onclick="MF_.showEditTaskSection('priority',${i})">
                            <img src="${currentTask.priority === 'low' ? lowPriority 
                            : currentTask.priority === 'medium' ? mediumPriority 
                            : highPriority}">
                            <i>Priority</i>
                        </div>
                        <div class="status" onclick="MF_.toggleTaskStatus(${i})">
                            <img src="${currentTask.status === true ? completed : incomplete }">
                            <i>${currentTask.status === true ? 'Completed' : 'Incomplete'}</i>
                        </div>
                        <div class="delete" onclick="MF_.deleteTask(${i})">
                            <img src="${deleteImage}">
                            <i>Delete</i>
                        </div>
                        <div class="tag" onclick="MF_.showEditTaskSection('tag',${i})">
                            <span class="material-icons-round">
                            ${currentTask.tag === 'home' ? 'home' 
                            : currentTask.tag === 'work' ? 'work'
                            : currentTask.tag === 'family' ? 'diversity_1'
                            : currentTask.tag === 'friends' ? 'diversity_2'
                            : currentTask.tag === 'pets' ? 'pets'
                            : currentTask.tag === 'gym' ? 'fitness_center' 
                            : currentTask.tag === 'me' ? 'face'
                            : currentTask.tag === 'sports' ? 'sports_soccer'
                            : currentTask.tag === 'food' ? 'lunch_dining'
                            : 'pending'
                            }
                            </span>
                            <i>${currentTask.tag}</i>
                        </div>
                    </div>
                    <div class="edit priority" style="display:none;" data-edit-task-priority-${i}>
                        <select name="edit-task-priority-${i}" id="new-task-priority-${i}">
                            <option value="" selected disabled hidden>Edit task priority</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        <button onclick="MF_.saveEditedTaskProperty('priority', ${i})">Change priority</button>
                        <button onclick="MF_.hideEditTaskSection('priority',${i})">Cancel edit</button>
                    </div>
                    <div class="edit tag" style="display:none;" data-edit-task-tag-${i}>
                        <div class="edit-tags-container">
                            <div>
                                <input type="radio" name="edit-tag-${i}" value="home" id="edit-home-${i}" required checked>
                                <label for="edit-home-${i}" class="tag-label">
                                    <span class="material-icons-round">home</span>
                                    <span class="text">Home</span>
                                </label>
                            </div>
                            <div>
                                <input type="radio" name="edit-tag-${i}" value="work" id="edit-work-${i}">
                                <label for="edit-work-${i}" class="tag-label">
                                    <span class="material-icons-round">work</span>
                                    <span class="text">Work</span>
                                </label>
                            </div>
                            <div>
                                <input type="radio" name="edit-tag-${i}" value="family" id="edit-family-${i}">
                                <label for="edit-family-${i}" class="tag-label">
                                    <span class="material-icons-round">diversity_1</span>
                                    <span class="text">Family</span>
                                </label>
                            </div>
                            <div>
                                <input type="radio" name="edit-tag-${i}" value="friends" id="edit-friends-${i}">
                                <label for="edit-friends-${i}" class="tag-label">
                                    <span class="material-icons-round">diversity_2</span>
                                    <span class="text">Friends</span>
                                </label>
                            </div>
                            <div>
                                <input type="radio" name="edit-tag-${i}" value="pets" id="edit-pets-${i}">
                                <label for="edit-pets-${i}" class="tag-label">
                                    <span class="material-icons-round">pets</span>
                                    <span class="text">Pets</span>
                                </label>
                            </div>
                            <div>
                                <input type="radio" name="edit-tag-${i}" value="gym" id="edit-gym-${i}">
                                <label for="edit-gym-${i}" class="tag-label">
                                    <span class="material-icons-round">fitness_center</span>
                                    <span class="text">Gym</span>
                                </label>
                            </div>
                            <div>
                                <input type="radio" name="edit-tag-${i}" value="me" id="edit-me-${i}">
                                <label for="edit-me-${i}" class="tag-label">
                                    <span class="material-icons-round">face</span>
                                    <span class="text">Me</span>
                                </label>
                            </div>
                            <div>
                                <input type="radio" name="edit-tag-${i}" value="sports" id="edit-sports-${i}">
                                <label for="edit-sports-${i}" class="tag-label">
                                    <span class="material-icons-round">sports_soccer</span>
                                    <span class="text">Sports</span>
                                </label>
                            </div>
                            <div>
                                <input type="radio" name="edit-tag-${i}" value="food" id="edit-food-${i}">
                                <label for="edit-food-${i}" class="tag-label">
                                    <span class="material-icons-round">lunch_dining</span>
                                    <span class="text">Food</span>
                                </label>
                            </div>
                            <div>
                                <input type="radio" name="edit-tag-${i}" value="others" id="edit-others-${i}">
                                <label for="edit-others-${i}" class="tag-label">
                                    <span class="material-icons-round">pending</span>
                                    <span class="text">Others</span>
                                </label>
                            </div>
                        </div>
                        <div class="buttons">
                            <button onclick="MF_.saveEditedTaskTag(${i})">Edit Tag</button>
                            <button onclick="MF_.hideEditTaskSection('tag',${i})">Cancel edit</button>
                        </div>
                    </div>
                `;
                tasksContainer.appendChild(card);
            // }
            flatpickr('input[type=datetime-local]', {enableTime:true, dateFormat:'l, J/F/Y, at G:i K.'});
        }
    },
    showEditTaskSection(prop, index)
    {
        document.querySelector(`[data-edit-task-${prop}-${index}]`).style.display = 'flex';
    },
    hideEditTaskSection(prop, index)
    {
        document.querySelector(`[data-edit-task-${prop}-${index}]`).style.display = 'none';
    },
    saveEditedTaskProperty(prop, index)
    {
        let projectIndex = document.querySelector('.active').getAttribute('data-project');
        let newValue = document.querySelector(`#new-task-${prop}-${index}`).value;
        if (newValue === '')
        {
            alert(`The new ${prop === 'dueDate' ? 'due date' : prop} can't be empty.`)
            return;
        }
        else
        {
            userProjects[projectIndex].tasks[index][prop] = newValue;
            this.renderTasks(projectIndex);
            localStorage.setItem('UserProjects', JSON.stringify(userProjects));
        }
    },
    saveEditedTaskTag(index)
    {
        let projectIndex = document.querySelector('.active').getAttribute('data-project');
        let newTag = document.querySelector(`input[name="edit-tag-${index}"]:checked`).value;
        if (newTag === '')
        {
            alert('The new tag can\'t be empty.')
            return;
        }
        else
        {   
            userProjects[projectIndex].tasks[index].tag = newTag;
            this.renderTasks(projectIndex);
            localStorage.setItem('UserProjects', JSON.stringify(userProjects));
        }
    },
    toggleTaskStatus(index)
    {
        let projectIndex = document.querySelector('.active').getAttribute('data-project');
        userProjects[projectIndex].tasks[index].status = !userProjects[projectIndex].tasks[index].status;
        this.renderTasks(projectIndex);
        localStorage.setItem('UserProjects', JSON.stringify(userProjects));
    },
    deleteTask(index)
    {
        let projectIndex = document.querySelector('.active').getAttribute('data-project');
        userProjects[projectIndex].tasks.splice(index, 1)
        this.renderTasks(projectIndex);
        localStorage.setItem('UserProjects', JSON.stringify(userProjects));
    }
};

window.MF_ = MF_;