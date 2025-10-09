let handler = async (m, { conn }) => {
  const nombre = 'Brauliovh3';
  const alias = 'DEPOOL';
  const descripcion = `
👤 *Creador:* ${nombre} (a.k.a. ${alias})
💙 Desarrollador principal de *Hatsune Miku Bot*

¡Gracias por usar el bot! Si quieres apoyar el proyecto, puedes hacerlo con un donativo. Tu ayuda permite que el bot siga activo y mejorando.
`;

  const buttons = [
    [
      {
        buttonId: '.apoyardepool',
        buttonText: { displayText: '💙 Apoyar' },
        type: 1
      },
      {
        buttonId: '.sabermasdepool',
        buttonText: { displayText: 'ℹ️ Saber más' },
        type: 1
      }
    ]
  ];

  await conn.sendMessage(m.chat, {
    text: descripcion,
    footer: '🌱 Gracias por tu apoyo',
    buttons: [
      { buttonId: '.apoyardepool', buttonText: { displayText: '💙 Apoyar' }, type: 1 },
      { buttonId: '.sabermasdepool', buttonText: { displayText: 'ℹ️ Saber más' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m });
};

handler.command = ['depool'];
handler.help = ['depool'];
handler.tags = ['info'];


let handlerApoyar = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    image: { url: 'https://i.postimg.cc/JnVS0C1z/yape.jpg' },
    caption: '💙 ¡Gracias por tu apoyo! Escanea el QR para donar vía Yape.'
  }, { quoted: m });
};
handlerApoyar.command = ['apoyardepool'];


let handlerSaberMas = async (m, { conn }) => {
  await conn.reply(m.chat, 'Puedes contactarme en GitHub: https://github.com/Brauliovh3 o en WhatsApp para más información.', m);
};
handlerSaberMas.command = ['sabermasdepool'];

export default [handler, handlerApoyar, handlerSaberMas];
