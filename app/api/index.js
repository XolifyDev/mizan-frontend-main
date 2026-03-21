});
});

app.post("/api/register", async (req, res) => {
    try {
        let { fname,
            lname,
            gender,
            madrasa,
            address,
            zipcode,
            state,
            level,
            phone,
            email,
            frontOrBack } = req.body;
        let image = req.files.image;
        console.log({
            fname,
            // lname,
            // gender,
            // madrasa,
            // address,
            // zipcode,
            // state,
            // level,
            // phone,
            // email,
            image,
            // frontOrBack
        })
        if (
            !fname ||
            !lname ||
            !gender ||
            !madrasa ||
            !address ||
            !zipcode ||
            !state ||
            !level ||
            !phone ||
            !email ||
            !image
        ) return res.json({
            error: true,
            msg: "Please fill in all fields!",
        });

        const emailInUse = await supabase.from("Participants").select().eq("email", email);

        // console.log(emailInUse, "EMAIL")

        if (emailInUse.error || !emailInUse.data) return res.json({
            error: true,
            msg: "Email already exists!",
        });
        const id = randomUUID();
        const { data, error } = await supabase.storage
            .from("images")
            .upload(`public/${fname}-${lname}-${id}.${image.name.split(".").pop()}`, image.data, {
                contentType: image.mimetype
            });
        if (error) return console.log(error),
            res.json({
                error: true,
                msg: error.message,
            });
        const { publicUrl } = supabase.storage
            .from("images")
            .getPublicUrl(`public/${fname}-${lname}-${id}.${image.name.split(".").pop()}`).data;

        const insert = await supabase.from("Participants").insert({
            categoryId: level,
            email,
            gender,
            frontOrBack,
            image: publicUrl,
            phone,
            address,
            madrasa,
            state,
            zipcode,
            name: `${fname} ${lname}`,
        }).select("*, category:Categories(*)");


        // console.log("INSRT", {insert})

        if (insert.error || !insert.data) return res.json({
            error: true,
            msg: "An Error occured when registrating the participant! Please try again!"
        });

        // const emailHtml = render(require("./registration-email.jsx")({ data: insert.data }));


        const options = {
            from: 'contact@atlqurancompetition.org',
            to: email,
            subject: `Registration completed for Atlanta Quran Competition! (${fname} ${lname})`,
            html: `
            <div style="display:-webkit-flex;display:-ms-flexbox;display:flex; align-items: center; justify-content: center; height: 101vh;">
            <div style="background-color: #f4f4f6; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); width: 100%; max-width: 40rem; padding: 2rem;">
              <header style="margin-bottom: 3rem; display:-webkit-flex;display:-ms-flexbox;display:flex; align-items: center; justify-content: space-between;">
                <div style="display:-webkit-flex;display:-ms-flexbox;display:flex; align-items: center;">
                  <span style="margin-left: auto; font-size: 2.5rem; font-weight: bold; color: #1f2937;">Atlanta Quran Competition</span>
                </div>
              </header>
              <table cellpadding="1" cellspacing="0" border="0" width="100%" style="max-width: 40rem; margin: 0 auto;">
    <tr>
        <td bgcolor="#f4f4f6" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 2rem;">
            <table cellpadding="1" cellspacing="0" border="0" width="100%">
                <tr>
                    <td align="center">
                        <h3 style="font-weight: bold; color: #1f2937;">Atlanta Quran Competition</h2>
                    </td>
                </tr>
            </table>
            <table cellpadding="1" cellspacing="0" border="0" width="100%">
                <tr>
                    <td bgcolor="#af10d52" style="border-radius: 8px; padding: 1.5rem;">
                        <table cellpadding="1" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td align="center">
                                    <img alt="Profile Image" src="${publicUrl}" width="81" height="80" style="border-radius: 50%; width: 80px; height: 80px; object-fit: cover;">
                                    <h4 style="font-weight: bold; font-size: 1.25rem; margin-top: 0;">${fname} ${lname}</h3>
                                    <p style="font-size: 1.875rem; margin-bottom: 0;">${insert.data[0].category.name}</p>
                                    <p style="font-size: 1.875rem; margin-bottom: 0;">${address} ${state} ${zipcode}</p>
                                    <p style="font-size: 1.875rem; margin-bottom: 0;">${email}</p>
                                    <p style="font-size: 1.875rem; margin-bottom: 0;">${phone}</p>
                                    <p style="font-size: 1.875rem; margin-bottom: 0;">${String(frontOrBack)[0].toUpperCase() + String(frontOrBack).slice(1)}</p>
                                    <button style="background-color: #fff; color: #af10d52; border: 1px solid #af9d52; border-radius: 4px; font-size: 0.875rem; font-weight: 500; padding: 0.5rem 1rem; margin-top: 1rem; cursor: default;">Registration Completed</button>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
              <footer style="margin-top: 3rem; border-top: 1px solid #d1d5db; padding-top: 1.5rem; font-size: 0.875rem; color: #4b5563;">
                <div>
                  <p>Atlanta Quran Competition | <a href="mail:contact@atlqurancompetition.org">contact@atlqurancompetition.org</a> | +2 (678) 790-3031</p>
                  <p style="margin-top: 1.5rem;">&copy; 2024 Atlanta Quran Competition. All rights reserved.</p>
                </div>
              </footer>
            </div>
          </div>
          
            `,
        };

        await transporter.sendMail(options).then(() => {
            return res.json({
                error: false,
                msg: "Thank you! Your registration was submitted successfully."
            })
        })


    } catch (e) {
        console.log(e, "ERROR");
        return res.json({
            error: true,
            msg: e.message
        })
    }
})

//
// app.post("/api/register", async (req, res) => {
//     try {
//         let { fname,
//             lname,
//             gender,
//             madrasa,
//             state,
//             level,
//             phone,
//             email,
//             frontOrBack } = req.body;
//         if (
//             !fname ||
//             !lname ||
//             !gender ||
//             !madrasa ||
//             !state ||
//             !level ||
//             !phone ||
//             !email
//         ) return res.json({
//             error: true,
//             msg: "Please fill in all fields!",
//         });
//
//         const emailInUse = await supabase.from("Participants").select().eq("email", email);
//
//         if (emailInUse.error || !emailInUse.data) return res.json({
//             error: true,
//             msg: "Email already exists!",
//         });
//
//         const id = randomUUID();       
//         const insert = await supabase.from("Participants").insert({
//             categoryId: level,
//             email,
//             gender,
//             frontOrBack,
//             image: "https://cbafgjxmssbvwpthlpel.supabase.co/storage/v1/object/public/images/public/PLACEHOLDER.png",
//             phone,
//             address: "",
//             madrasa,
//             state,
//             zipcode: "",
//             name: `${fname} ${lname}`,
//         }).select("*, category:Categories(*)");
//
//         if (insert.error || !insert.data) return res.json({
//             error: true,
//             msg: "An Error occured when registrating the participant! Please try again!"
//         });
//
//         const options = {
//             from: 'contact@atlqurancompetition.org',
//             to: email,
//             subject: `Registration completed for Atlanta Quran Competition! (${fname} ${lname})`,
//             html: `
//             <div style="display:-webkit-flex;display:-ms-flexbox;display:flex; align-items: center; justify-content: center; height: 100vh;">
//             <div style="background-color: #f3f4f6; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); width: 100%; max-width: 40rem; padding: 2rem;">
//               <header style="margin-bottom: 2rem; display:-webkit-flex;display:-ms-flexbox;display:flex; align-items: center; justify-content: space-between;">
//                 <div style="display:-webkit-flex;display:-ms-flexbox;display:flex; align-items: center;">
//                   <span style="margin-left: auto; font-size: 1.5rem; font-weight: bold; color: #1f2937;">Atlanta Quran Competition - GT MSA</span>
//                 </div>
//               </header>
//               <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 40rem; margin: 0 auto;">
//     <tr>
//         <td bgcolor="#f3f4f6" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 2rem;">
//             <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                 <tr>
//                     <td align="center">
//                         <h2 style="font-weight: bold; color: #1f2937;">Atlanta Quran Competition</h2>
//                     </td>
//                 </tr>
//             </table>
//             <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                 <tr>
//                     <td bgcolor="#af9d52" style="border-radius: 8px; padding: 1.5rem;">
//                         <table cellpadding="0" cellspacing="0" border="0" width="100%">
//                             <tr>
//                                 <td align="center">
//                                     <img alt="Profile Image" src="${publicUrl}" width="80" height="80" style="border-radius: 50%; width: 80px; height: 80px; object-fit: cover;">
//                                     <h3 style="font-weight: bold; font-size: 1.25rem; margin-top: 0;">${fname} ${lname}</h3>
//                                     <p style="font-size: 0.875rem; margin-bottom: 0;">${insert.data[0].category.name}</p>
//                                     <p style="font-size: 0.875rem; margin-bottom: 0;">${address} ${state} ${zipcode}</p>
//                                     <p style="font-size: 0.875rem; margin-bottom: 0;">${email}</p>
//                                     <p style="font-size: 0.875rem; margin-bottom: 0;">${phone}</p>
//                                     <p style="font-size: 0.875rem; margin-bottom: 0;">${String(frontOrBack)[0].toUpperCase() + String(frontOrBack).slice(1)}</p>
//                                     <button style="background-color: #fff; color: #af9d52; border: 1px solid #af9d52; border-radius: 4px; font-size: 0.875rem; font-weight: 500; padding: 0.5rem 1rem; margin-top: 1rem; cursor: default;">Registration Completed</button>
//                                 </td>
//                             </tr>
//                         </table>
//                     </td>
//                 </tr>
//             </table>
//         </td>
//     </tr>
// </table>
//               <footer style="margin-top: 2rem; border-top: 1px solid #d1d5db; padding-top: 1.5rem; font-size: 0.875rem; color: #4b5563;">
//                 <div>
//                   <p>Atlanta Quran Competition | <a href="mail:contact@atlqurancompetition.org">contact@atlqurancompetition.org</a> | +1 (678) 790-3031</p>
//                   <p style="margin-top: 0.5rem;">&copy; 2024 Atlanta Quran Competition. All rights reserved.</p>
//                 </div>
//               </footer>
//             </div>
//           </div>
//           
//             `,
//         };
//
//         await transporter.sendMail(options).then(() => {
//             return res.json({
//                 error: false,
//                 msg: "Thank you! Your registration was submitted successfully."
//             })
//         })
//
//
//     } catch (e) {
//         console.log(e, "ERROR");
//         return res.json({
//             error: true,
//             msg: e.message
//         })
//     }
// })

const io = new Server(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
    socket.on("setroom", (data) => {
        socket.join(`room-${data.user.id}-question-set`)
    })
    socket.on("pick-quran-set", (data) => {
        console.log('QUESTION_SET', data.user.id)
        io.to(`room-${data.user.id}-question-set`).emit("question-pick")
    })
})

server.listen(3217, () => {
    console.log("✅ Socket server started on port | 3217")
})

