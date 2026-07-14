import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from .models import Message

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    """
    Consumidor asíncrono para el chat en tiempo real a través de WebSockets.
    """
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Unirse a la sala (room group)
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Salir de la sala
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Recibir mensaje de WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message')
        sender_id = text_data_json.get('sender_id')
        receiver_id = text_data_json.get('receiver_id')

        # Guardar mensaje en base de datos
        await self.save_message(sender_id, receiver_id, message)

        # Enviar mensaje a la sala (room group)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': sender_id
            }
        )

    # Recibir mensaje del room group
    async def chat_message(self, event):
        message = event['message']
        sender_id = event['sender_id']

        # Enviar mensaje por WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'sender_id': sender_id
        }))

    @sync_to_async
    def save_message(self, sender_id, receiver_id, message):
        """
        Guarda el mensaje de chat en la base de datos de forma asíncrona.
        """
        try:
            sender = User.objects.get(id=sender_id)
            receiver = User.objects.get(id=receiver_id)
            Message.objects.create(sender=sender, receiver=receiver, content=message)
        except User.DoesNotExist:
            pass
