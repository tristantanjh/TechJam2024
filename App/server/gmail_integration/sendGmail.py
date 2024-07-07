import smtplib
from email.mime.text import MIMEText

def send_email(subject, body, recipient, auth):
    
    sender = list(auth.keys())[0]
    password = list(auth.values())[0]

    text = f"""
            Dear {recipient},
            
            {body}

            Regards,
            {sender}
            """

    msg = MIMEText(text)
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = recipient
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
       smtp_server.login(sender, password)
       smtp_server.sendmail(sender, recipient, msg.as_string())
    print("Gmail sent!")

