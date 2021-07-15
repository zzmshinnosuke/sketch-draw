<?php
namespace app\index\controller;
use think\Controller;
use think\Db;

class Index
{
	
	private function save_image($folder)
	{			
		try
		{
			$task = input('param.task/d', 0);
			$suffix = input('param.suffix/s', "");
			
			if ($folder === 1||$folder === 2) {
				$json = input('param.json/s', "");
				$file = fopen('backup' . $folder . '/'. $task . '_' . $suffix . '.json', "w");
				fwrite($file, $json);
				fclose($file);
				$file = fopen('results' . $folder . '/'. $task . '.json', "w");
				fwrite($file, $json);
				fclose($file);
			}

			
			echo 1;	
		} catch (\Exception $e) {
			echo 0;
		}
	}

	private function show() {
		try {
			$task = input('param.task/d', 0);
			$backup = input('param.backup/d', 0);
			
			$filename = "results1/" . $task . ".json";
			if ($backup === 1) {
				$task = input('param.task/s', '');
				$filename = "backup1/" . $task . ".json";
			}
			
			if ( !file_exists($filename) ) {
				echo $filename;
				return;
			}
			$file = fopen($filename, "r");
			$contents = fread($file, filesize($filename));
			fclose($file);
			
		} catch (\Exception $e) {
			echo 0;
		}
		return view('show', [
			'task' => $task, 
			'contents' => $contents,
		 ]);
		 
	}

	private function load_json() {
		try {
			$task = input('param.task/d', 0);
			$backup = input('param.backup/d', 0);
			
			$filename = "results1/" . $task . ".json";
			if ($backup === 1) {
				$task = input('param.task/s', '');
				$filename = "backup1/" . $task . ".json";
			}
			
			if ( !file_exists($filename) ) {
				echo 0;
				return;
			}
			$file = fopen($filename, "r");
			$contents = fread($file, filesize($filename));
			fclose($file);
			echo $contents;
		} catch (\Exception $e) {
			echo 0;
		}	 
	}
	
	private function admin($passwd) {
		if ($passwd != config("app_password")
			&& $passwd != "check") {
			echo "Invalid user.";
			return; 
		} 
		$start = input('param.start/d', 1);
		if ($start < 1) $start = 1; 
		$N = config("total_tasks");
		$end = input('param.end/d', $N);
		if ($end > $N) $end = $N; 
		
		$list = array(); 
		$check_list = array(); 
		$completed = 0; 
		$done = 0;
		for ($i = $start; $i <= $end; ++$i) {
			$filename = "results1/" . $i . ".json";
			if ( file_exists($filename) ) {
				array_push($list, $i); 
				++$completed;
			}
			$filename1 = "results2/" . $i . ".json";
			if ( file_exists($filename1) ) {
				array_push($check_list, $i); 
				++$done;
			}
		}
		if ($passwd == "check") 
		{
			return view("check", [
				'admin' => 'Admin',
				'total' => $N,
				'completed' => $completed,
				'percentage' => $completed / $N * 100,
				'done' => $done,
				'list' => json_encode($list),
				'check_list' => json_encode($check_list),
				'passwd' => $passwd,
			]);
		}
		
		return view("admin", [
			'admin' => 'Admin',
			'total' => $N,
			'completed' => $completed,
			'percentage' => $completed / $N * 100,
			'done' => $done,
			'list' => json_encode($list),
			'check_list' => json_encode($check_list),
			'passwd' => $passwd,
		]);
	}
	
	private function history() {
		$task = input('param.history/d', 0);
		$ans = glob("backup1/" . $task ."_*.json"); 
		if (empty($ans)) return;
		usort($ans, create_function('$a,$b', 'return filemtime($b) - filemtime($a);'));
		
		foreach ($ans as &$filename) {
			$filename = substr(substr($filename, 8), 0, -5);
		}
		echo json_encode($ans); 
	}
	
    public function index()
    {
		$task = input('param.task/d', 1);
		if ($task <= 0) $task = 0; 
		
        $show = input('param.show/d', -1);
		if ($show !== -1) {
			return $this->show();
		}

		$load = input('param.load/d', -1);
		if ($load !== -1) {
			return $this->load_json();
		}
		
        $history = input('param.history/d', -1);
		if ($history !== -1) {
			return $this->history();
		}
		
        $save = input('param.save/d', -1);
		if ($save !== -1) {
			return $this->save_image($save);
		}

        $user = input('param.user/s', null);
		if ($user != null) {
			return $this->admin($user); 
		}

		// read the txt 
		$file = fopen("public/images/background_box.txt", "r") or die("Unable to open file!");
		$total = 0; 
		$M = (int)fgets($file);
		for ($j = 0; $j < $M; ++$j) {
			$line = explode(';',fgets($file));
			$name= $line[0];
			$boxs=$line[1];
			$categories=$line[1];
			++$total;
			if ($total >= $task) break; 
		}
	
		fclose($file);

		return view('index', [
			'task' => $task, 
			'reference' => trim($name),
			'ver' => '19'
 		]);
	}
	
}
