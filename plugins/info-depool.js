let handler = async (m, { conn }) => {
  const nombre = 'Brauliovh3';
  const alias = 'DEPOOL';
  const descripcion = `
👤 *Creador:* ${nombre} (a.k.a. ${alias})
💙 Desarrollador principal de *Hatsune Miku Bot*

¡Gracias por usar el bot! Si quieres apoyar el proyecto, puedes hacerlo con un donativo. Tu ayuda permite que el bot siga activo y mejorando.
`;

  await conn.sendMessage(m.chat, {
    image: { url: 'https://i.postimg.cc/JnVS0C1z/yape.jpg' },
    caption: descripcion + '\n\n💙 ¡Gracias por tu apoyo! Escanea el QR para donar vía Yape.'
  }, { quoted: m });
};
handler.command = ['depool'];
handler.help = ['depool'];
handler.tags = ['info'];
export default handler;
