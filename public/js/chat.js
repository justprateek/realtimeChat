const socket = io()


//Elements
const $messageform = document.querySelector('#message-form')
const $messageinput = $messageform.querySelector('input')
const $messagebutton = $messageform.querySelector('button')
const $messages = document.querySelector('#messages')



//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username , room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message',(message)=>{
    //console.log(msg)
    const html = Mustache.render($messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeEnd', html)
    autoScroll()
})

socket.emit('join', {username,room}, (error)=>{
    if(error){
        alert(error)
        location.href= '/'
    }
})

socket.on('roomData', ({room,users})=>{
    const html = Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

document.querySelector('#message-form').addEventListener('submit',(e)=>{
    e.preventDefault()
    const msg = e.target.elements.message.value
    $messagebutton.setAttribute('disabled',true)
    

    //console.log(msg)
    socket.emit('sendMessage', msg,(error)=>{
        $messagebutton.removeAttribute('disabled')
        $messageinput.value = ''
        $messageinput.focus()
        if(error){
            return console.log(error)
        }
        console.log('message delivered')
    })
})

