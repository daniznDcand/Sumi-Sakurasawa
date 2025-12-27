
export function sendCompatibleMessage(conn, jid, content, options = {}) {
    
    const isBusinessClient = conn.user?.id?.includes('business') || 
                            conn.user?.name?.toLowerCase().includes('business') ||
                            options.forceBusiness === true;
    
    
    if (content.buttons && !isBusinessClient) {
        let textMessage = content.text || content.caption || '';
        
        
        if (content.buttons.length > 0) {
            textMessage += '\n\n📋 *Opciones disponibles:*\n';
            content.buttons.forEach((btn, index) => {
                const buttonText = btn.buttonText?.displayText || btn[0] || 'Opción';
                const buttonId = btn.buttonId || btn[1] || '';
                textMessage += `${index + 1}. ${buttonText}\n`;
            });
            textMessage += '\n💡 *Responde con el número de la opción que deseas*';
        }
        
        
        return conn.sendMessage(jid, {
            text: textMessage,
            ...options
        }, { quoted: options.quoted });
    }
    
    
    if (content.sections && !isBusinessClient) {
        let textMessage = content.text || '';
        textMessage += '\n\n📋 *Opciones disponibles:*\n';
        
        let optionNumber = 1;
        content.sections.forEach(section => {
            if (section.title) {
                textMessage += `\n*${section.title}*\n`;
            }
            if (section.rows) {
                section.rows.forEach(row => {
                    textMessage += `${optionNumber}. ${row.title || row.displayText}\n`;
                    if (row.description) {
                        textMessage += `   └ ${row.description}\n`;
                    }
                    optionNumber++;
                });
            }
        });
        
        textMessage += '\n💡 *Responde con el número de la opción que deseas*';
        
        return conn.sendMessage(jid, {
            text: textMessage,
            ...options
        }, { quoted: options.quoted });
    }
    
    
    if (content.buttons) {
        return conn.sendMessage(jid, content, options);
    } else if (content.sections) {
        return conn.sendMessage(jid, content, options);
    } else {
        return conn.sendMessage(jid, content, options);
    }
}


export function processNumericResponse(text, lastMenuButtons) {
    if (!lastMenuButtons || !text) return null;
    
    const number = parseInt(text.trim());
    if (isNaN(number) || number < 1 || number > lastMenuButtons.length) {
        return null;
    }
    
    
    const selectedButton = lastMenuButtons[number - 1];
    return selectedButton.buttonId || selectedButton[1] || null;
}

export default { sendCompatibleMessage, processNumericResponse };