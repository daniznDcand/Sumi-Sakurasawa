let handler = async (m, { conn }) => {
  const nombre = 'Brauliovh3';
  const alias = 'DEPOOL';
  const descripcion = `
👤 *Creador:* ${nombre} (BVH3 ${alias})
💙 Desarrollador principal de *Hatsune Miku Bot*

¡Gracias por usar el bot! Si quieres apoyar el proyecto, puedes hacerlo con un donativo. Tu ayuda permite que el bot siga activo y mejorando.

🌱 Elige una opción:`;

  const buttons = [
    { buttonId: 'apoyardepool', buttonText: { displayText: '💙 Apoyar' }, type: 1 },
    { buttonId: 'sabermasdepool', buttonText: { displayText: 'ℹ️ Saber más' }, type: 1 }
  ];

  await conn.sendMessage(m.chat, {
    text: descripcion,
    footer: 'Gracias por tu apoyo',
    buttons: buttons,
    headerType: 4
  }, { quoted: m });
};
handler.command = ['depool'];
handler.help = ['depool'];
handler.tags = ['info'];
export default handler;


export async function apoyardepool(m, { conn }) {
  await conn.sendMessage(m.chat, {
    image: { url: 'https://i.postimg.cc/JnVS0C1z/yape.jpg' },
    caption: '💙 ¡Gracias por tu apoyo! Escanea el QR para donar vía Yape.'
  }, { quoted: m });
}
apoyardepool.command = ['apoyardepool'];


export async function sabermasdepool(m, { conn }) {
  await conn.reply(m.chat, 'Puedes contactarme en GitHub: https://github.com/Brauliovh3 o en WhatsApp para más información.', m);
}
sabermasdepool.command = ['sabermasdepool'];
