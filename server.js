const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

let aktifKullanicilar = {};
let mesajGecmisi = []; // Mesajları burada tutacağız (Kalıcı hafıza için veritabanı gerekir)

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

io.on('connection', (socket) => {
    
    socket.on('yeni-kullanici', (isim) => {
        aktifKullanicilar[socket.id] = isim;
        
        // Yeni giren kişiye geçmiş mesajları gönder
        socket.emit('gecmis-mesajlar', mesajGecmisi);
        
        io.emit('kullanici-listesi', Object.values(aktifKullanicilar));
        io.emit('mesaj', {kimden: "Sistem", icerik: `${isim} sohbete katıldı.`});
    });

    socket.on('mesaj', (veri) => {
        const yeniMesaj = { kimden: veri.isim, icerik: veri.mesaj };
        mesajGecmisi.push(yeniMesaj); // Sepete ekle
        io.emit('mesaj', yeniMesaj); // Herkese gönder
    });

    socket.on('disconnect', () => {
        const isim = aktifKullanicilar[socket.id];
        delete aktifKullanicilar[socket.id];
        io.emit('kullanici-listesi', Object.values(aktifKullanicilar));
        if(isim) io.emit('mesaj', {kimden: "Sistem", icerik: `${isim} ayrıldı.`});
    });
});

http.listen(3000, () => console.log('Sunucu ayakta!'));