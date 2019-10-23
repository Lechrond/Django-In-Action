class FormMixin(object):
    def get_errors(self):
        if hasattr(self, 'errors'):
            errors = self.errors.get_json_data()
            new_errors = {}
            for key, message_dicts in errors.items():
                message = []
                for message in message_dicts:
                    message.append(message['message'])
                new_errors[key] = message
            return new_errors
        else:
            return {}
