
curtime=`date +%Y-%m-%d_%H-%M-%S`

main() {
	local typ=$1
	local curtime=`date +%Y-%m-%d_%H-%M-%S`
	mkdir "log"
	cp  "${typ}_log.log" "log/${typ}_log_${curtime}.log"
	cat "${typ}_log.log" | grep -i "<runtime" >> "log/${typ}_error.log"
}

main "www"
