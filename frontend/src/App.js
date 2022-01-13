import React, {Component} from "react";
import './App.css';

class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      todos:[],
      // the object to be edited
      activeItem:{
        id:null,
        title:'',
        completed:false
      },
      editing:false,
      disabled:true,
    }
    this.fetchTasks = this.fetchTasks.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getCookie = this.getCookie.bind(this)
    this.startEdit = this.startEdit.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
    this.toggleStrike = this.toggleStrike.bind(this)
    

  };

    //TOKEN
  getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  };


  componentDidMount(){
    this.fetchTasks()
  }


  // Makes Api call
  fetchTasks(){
    //console.log('fetching.....')
    fetch('http://127.0.0.1:8000/api/task-list/')
    .then(res=>res.json())
    .then(data=> this.setState({todos:data}))
  }

  handleChange(e){
    let name = e.target.name;
    let value = e.target.value
    this.setState({
      // use spread operator to update child elements of object
      activeItem:{...this.state.activeItem,
        title:value,
      }
    })
  }


  handleSubmit(e){
    e.preventDefault();
    //console.log('ITEM', this.state.activeItem)

    //token
    let csrftoken = this.getCookie('csrftoken');

    let url ="http://127.0.0.1:8000/api/task-create/";

    if(this.state.editing==true){
      url = `http://127.0.0.1:8000/api/task-update/${this.state.activeItem.id}/`;
      //Reset Editing
      this.setState({editing:false});
    }

    fetch(url,{
      method:"POST",
      headers:{
        'Content-type':'application/json',
        'X-CSRFToken':csrftoken,
      },
      body: JSON.stringify(this.state.activeItem)
    }).then((res)=>{
      //reload all the tasks
      this.fetchTasks()
      // Reset the activeItem
      this.setState({activeItem:{
        id:null,
        title:'', 
        completed:false
      }

    })
    }).catch((err)=> console.log('ERROR:',err))
  }

  startEdit(task){
    this.setState({
      activeItem:task,
      editing:true
    })
  };

  deleteItem(task){
    //token
    let csrftoken = this.getCookie('csrftoken');
    let url = `http://127.0.0.1:8000/api/task-delete/${task.id}/`;

    fetch(url,{
      method:'DELETE',
      headers:{
        'Content-type':'application/json',
        'X-CSRFToken':csrftoken,
      },
    }).then(res=>{
      // Reload all Tasks
      this.fetchTasks();

    })

  };

  toggleStrike(task){
    task.completed = !task.completed;
    //token
    let csrftoken = this.getCookie('csrftoken');
    let url = `http://127.0.0.1:8000/api/task-update/${task.id}/`;
    
    fetch(url,{
      method:"POST",
      headers:{
        'Content-type':'application/json',
        'X-CSRFToken':csrftoken,
      }, 
      body: JSON.stringify(
      {
        'completed':task.completed,
        'title':task.title

      })
    }).then(res=> this.fetchTasks())

    //console.log(task.completed);

  }



  render(){
    let tasks = this.state.todos;
    let self = this;
    //console.log(tasks);
    return(
      <div className="container">
          <div id="task-container">
            {/**FORM */}
            <div id="form-wrapper">
              <form id="form" onSubmit={this.handleSubmit}>
                  <div className="flex-wrapper">
                    {/*INPUT FIELD*/}
                    <div style={{flex:6}}>
                      <input disabled ={this.state.disabled} onChange={this.handleChange}
                      value ={this.state.activeItem.title}
                      className="form-control" id="title" name="title" placeholder="Add Todo..."/>
                    </div>

                    <div style={{flex:1}}>
                      <input id="submit" className="btn btn-warning" type="submit" name="add"/>
                    </div>
                  </div>
              </form>

            </div>

            {/*LIST OF TODOS*/}
            <div id="list-wrapper">
                {tasks.map(function(task, index){
                  return (
                    <div key={index} className="task-wrapper flex-wrapper">
                        {/*title*/}
                        <div onClick={()=>self.toggleStrike(task)}  style={{flex:"7"}}> 
                          {task.completed == false? (
                            <span>{task.title}</span>
                          ):(
                            <strike>{task.title}</strike>
                          )}
                          
                        </div>
                        <div  style={{flex:"1"}}>
                          <button onClick={()=>self.startEdit(task)} 
                          className="btn btn-sm btn-outline-info">Edit</button>
                        </div>
                        <div style={{flex:"1"}}> 
                          <button disabled  onClick={()=>self.deleteItem(task)}  className="btn btn-outline-dark btn-sm delete">-</button>
                        </div>

                    </div>
                  )
                })}
            </div>
          </div>
      </div>
    )
  }
}


export default App;

