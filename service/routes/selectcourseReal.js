/**
 * 課程加選處理（學生）
 */
app.post(urlprefix + '/service/selectcourseReal.json', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');

    //學生資料（SESSION）
    var user = req.session.user?req.session.user:{};
	var admin = req.session.admin?req.session.admin:'';
	var failcause = '';
	var is_admin = (admin == 'admin') ? true : false;
	if(is_admin){
		failcause = admin;
	}
	
	if(user.studentid  != null) {
		//課程清單（網頁表單）    
		var courses = req.body['courses'].split(',');

		//預備批次寫入資料庫的資料陣列
		var docs = new Array();
		var docs2 = new Array();

		courses.forEach(function(course) {
			
			//用冒號分隔 semcourseid 及 courseid
			var course_arr = course.split(':');

			//tSelectedSemCus 加選資料表
			docs.push({
				semcourseid: course_arr[0], //學期課號
				courseid: course_arr[1],    //課號
				studentid: user.studentid,  //學生代碼
				studentno: user.studentno,  //學號
				timestamp: new Date().getTime(),            //時間戳記
				serialno: 1,                                //志願順序
				createdate: new Date().getTime(),           //資料建立日期
				regtype: '2'                                //選課類型（2=>即選即上）
			});

			//tSelectedAddDel 選課記錄資料表
			docs2.push({
				semcourseid: course_arr[0],
				courseid: course_arr[1],
				studentid: user.studentid,
				studentno: user.studentno,
				createdate: new Date().getTime(),
				adddel: '加選',
				checked: '通過',
				regtype: '2',
				failcause: failcause
			});		
			
			//admin選課不增減人數
			if(!is_admin) {
				//tSemesterCusWeb 課程資料表
				//已選人數變更
				db.collection('tSemesterCusWeb').update( { semcourseid: course_arr[0] }, { $inc:{ selectedcount : 1 } } );

				//已選人數表更新
				db.collection('tSelectedCount').update(
					{ semcourseid: course_arr[0] },
					{ $inc: {count: 1} },
					{ upsert: true, multi: false, safe: true},
					function(err) {
						// if (err) { ... }
					}
				);
			}
		});

		console.log(docs);

		var options = {
			upsert: true,
			multi: false,
			safe: true
		};

		//選課過程記錄
		db.collection('tSelectedAddDel').insert(docs, options, function() {});

		//加選
		db.collection('tSelectedSemCus').insert(docs, options, function() {
			var results = {
				success: true,
				data: {
					docs: docs
				}
			};
			res.send(JSON.stringify(results));
			res.end();
		});
	} else {
		var results = {
            success: false,
            reason: 'session lost.'
        };
		
		res.send(JSON.stringify(results));
        res.end();
	}
});