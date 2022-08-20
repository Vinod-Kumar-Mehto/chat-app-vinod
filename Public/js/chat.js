const socket = io()

const messageForm = document.querySelector("form")
const messageInput = messageForm.querySelector("input")
const messageButton = messageForm.querySelector("button")
const messages =  document.querySelector("#message")
const messageTemplate = document.querySelector("#messageTemplate").innerHTML
const locationMessage = document.querySelector("#locationMessage").innerHTML   
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
const autoScroll = ()=>{
    const newMessage = messages.lastElementChild
    const newMessageStyle = getComputedStyle(newMessage)   
    const NewMeassageMargin = parseInt(newMessageStyle.marginBottom) 
    const newMessageHeight = newMessage.offsetHeight + NewMeassageMargin
    const visibleHeight = messages.offsetHeight
    
    const containerHeight = messages.scrollHeight

    const scrollOffset = messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){

        messages.scrollTop = messages.scrollHeight

    }



}
socket.on("location",(url)=>{

    const html = Mustache.render(locationMessage,{
        username:url.username,
       url: url.url,
       createdAt:moment(url.createdAt).format("h:mm a")
    }) 
    messages.insertAdjacentHTML("beforeend", html)
    autoScroll()
})

socket.on("roomData", ({room, users})=>{
       const html = Mustache.render(sidebarTemplate, {
            room,
            users

       })     
       document.querySelector("#sidebar").innerHTML = html

})

socket.on("message",(message)=>{
    
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    })    
      messages.insertAdjacentHTML("beforeend", html)  
        autoScroll()

})

messageForm.addEventListener("submit",(e)=>{
    e.preventDefault()
    messageButton.setAttribute("disabled", "disabled")
    const message = e.target.elements.message.value
    socket.emit("message", message,(error)=>{
        messageInput.value = ""
        messageInput.focus()
        if(error){
          return "profane is not allowed"

        }
        messageButton.removeAttribute("disabled")

    })

})

document.querySelector("#location").addEventListener("click",()=>{

if(!navigator.geolocation){
    return alert("your browser does not support geolocation")

}

navigator.geolocation.getCurrentPosition((position)=>{
    messageButton.setAttribute("disabled", "disabled")
    const lat = position.coords.latitude
    const long = position.coords.longitude
    socket.emit("location", {lat,long},()=>{

        messageButton.removeAttribute("disabled")
    } )

})

})

socket.emit('join',{username, room},(error)=>{

    if(error){
        alert(error)
        location.href = "/"

    }
})