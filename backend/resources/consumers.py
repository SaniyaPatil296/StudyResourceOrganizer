
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class StudyNotificationConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        user = self.scope.get("user")

        # Reject users without valid authentication
        if not user or not user.is_authenticated:
            await self.close(code=4001)
            return

        # Each user gets a separate notification group
        self.group_name = f"study_notifications_{user.id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        await self.send_json({
            "type": "connection_established",
            "message": "Connected to your private study notifications."
        })

        print(f"WebSocket connected for user: {user.id}")

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

        print("WebSocket disconnected:", close_code)

    async def receive_json(self, content, **kwargs):
        if content.get("type") == "ping":
            await self.send_json({
                "type": "pong",
                "message": "Connection is active."
            })

    async def notification_message(self, event):
        await self.send_json({
            "type": "notification",
            "data": event["data"]
        })
