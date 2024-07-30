import React, { useCallback, useEffect, useState } from "react";
import { Button, ButtonGroup, Card, Col, Row, Table } from "reactstrap";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, LineChart, Line } from "recharts";
import { useUser } from "contexts/UserContext";
import moment from "moment";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;

function Statistics() {
    const { user } = useUser();  
    const [symptomData, setSymptomData] = useState([]);
    const [symptomCategorys, setSymptomCategorys] = useState("");
    const [workNoteData, setWorkNoteData] = useState([]);

    const fetchSymptomData = useCallback(async() => {
        if(user) {
            const response = await axios.get(`${BASE_URL}/api/statistics/getSymptomData`, {
                params: {
                    userId: user.userId,
                    schoolCode: user.schoolCode
                }
            });

            if(response.data) {
                setSymptomData(response.data);
            }
        }
    }, [user]);

    const fetchSymptomCategory = useCallback(async() => {
        if(user) {
            try {
                const response = await axios.get(`${BASE_URL}/api/statistics/getSymptomCategory`, {
                    params: {
                        userId: user.userId,
                        schoolCode: user.schoolCode
                    }
                });
    
                if(response.data && response.data.length > 0 && response.data[0].hasOwnProperty('symptom_categorys')) {
                    setSymptomCategorys(response.data[0].symptom_categorys);
                }else{
                    setSymptomCategorys([]);
                }
            } catch (error) {
                console.log("증상 카테고리 데이터 조회 중 ERROR", error);
                setSymptomCategorys([]);
            }
        }
    }, [user]);

    const fetchWorkNoteData = useCallback(async() => {
        if(user) {
            const response = await axios.get(`${BASE_URL}/api/workNote/getEntireWorkNote`,{
                params: {
                  userId: user.userId,
                  schoolCode: user.schoolCode
                }
            });
    
            if(response.data) {
                setWorkNoteData(response.data);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchSymptomData();
        fetchSymptomCategory();
        fetchWorkNoteData();
    }, [fetchSymptomData, fetchSymptomCategory, fetchWorkNoteData]);

    const dataLoaded = symptomData.length > 0 && symptomCategorys && workNoteData.length > 0;

    const symptomMapping = {};
    if(dataLoaded) {
        symptomCategorys.split("::").forEach(pair => {
            const [symptom, category] = pair.split(":");
            symptomMapping[symptom.trim()] = category.trim();
        });
    }

    const categoryCounts = {
        감염증: 0,
        구강치아계: 0,
        근골격계: 0,
        비뇨생식기계: 0,
        소화기계: 0,
        순환기계: 0,
        안과계: 0,
        이비인후과계: 0,
        정신신경계: 0,
        피부피하계: 0,
        호흡기계: 0,
        기타: 0
    };

    if(dataLoaded) {
        symptomData.forEach(row => {
            row.worknote_symptom.split("::").forEach(symptom => {
                const trimmedSymptom = symptom.trim();
                const category = symptomMapping[trimmedSymptom];
                if(category) {
                    if(categoryCounts[category] !== undefined) {
                        categoryCounts[category]++;
                    }else{
                        category['기타']++;
                    }
                }else{
                    categoryCounts['기타']++;
                }
            });
        });
    }

    const fullHourlyData = Array.from({ length: 10 }, (_, i) => ({
        hour: 9 + i,
        male: 0,
        female: 0
    }));

    if(dataLoaded) {
        workNoteData.forEach(({ updatedAt, sGender }) => {
            const visitHour = moment(updatedAt).hour();
            if(visitHour >= 9 && visitHour < 19) {
                const index = visitHour - 9;
                if(sGender === "남") {
                    fullHourlyData[index].male++;
                }else if(sGender === "여") {
                    fullHourlyData[index].female++;
                }
            }
        });
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{ backgroundColor: "#fff", padding: "10px", border: "1px solid #ccc" }}>
                    <p className="label">{`${label}시간대 방문 학생`}</p>
                    <p className="intro" style={{ color: '#8884d8'}}>{`남학생: ${payload[0].value}`}</p>
                    <p className="intro" style={{ color: '#82ca9d'}}>{`여학생: ${payload[1].value}`}</p>
                </div>
            );
        }

        return null;
    };

    const CustomVisitTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{ backgroundColor: "#fff", padding: "10px", border: "1px solid #ccc" }}>
                    <p className="label">{`${label}`}</p>
                    <p className="intro" style={{ color: '#8884d8'}}>{`방문수 : ${payload[0].value}`}</p>
                </div>
            );
        }

        return null;
    };

    const studentVisitCounts = {};

    if(dataLoaded) {
        workNoteData.forEach(({ sName }) => {
            if(studentVisitCounts[sName]) {
                studentVisitCounts[sName]++;
            }else{
                studentVisitCounts[sName] = 1;
            }
        });
    }

    const sortedStudentVisitData = Object.keys(studentVisitCounts)
    .map(name => ({
        name,
        visits: studentVisitCounts[name]
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10);  // 상위 10명까지 획득

    const bodyPartsCounts = {};

    if(dataLoaded) {
        workNoteData.forEach(({ bodyParts }) => {
            if(bodyPartsCounts[bodyParts]) {
                bodyPartsCounts[bodyParts]++;
            }else{
                bodyPartsCounts[bodyParts] = 1;
            }
        });
    }

    const bodyPartsData = Object.keys(bodyPartsCounts).map(part =>  ({
        name: part,
        value: bodyPartsCounts[part]
    }));

    const sortedBodyPartsData = bodyPartsData
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // 상위 10개까지 획득

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6347', '#ADFF2F', '#FFD700', '#1E90FF', '#FF69B4', '#8A2BE2'];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const CustomBloodPressureTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const student = payload[0].payload;
            return (
                <div className="custom-tooltip" style={{ backgroundColor: "#fff", padding: "10px", border: "1px solid #ccc" }}>
                    <p className="label font-weight-bold">{`${student.sGrade}학년 ${student.sClass}반 ${student.sNumber}번 ${student.sGender} ${student.sName}`}</p>
                    <p className="intro" style={{ color: '#EC5353'}}>{`수축기 혈압: ${student.systolicBloodPressure}`}</p>
                    <p className="intro" style={{ color: '#0088FE'}}>{`이완기 혈압: ${student.diastolicBloodPressure}`}</p>
                </div>
            );
        }

        return null;
    };

    const bloodPressureData = workNoteData
    .filter(entry => {
        if (typeof entry.bloodPressure !== 'string') return false;
        const parts = entry.bloodPressure.split('/');
        if (parts.length !== 2) return false;
        const [systolic, diastolic] = parts.map(Number);
        return !isNaN(systolic) && !isNaN(diastolic);
    })
    .map(entry => {
        const [systolicBloodPressure, diastolicBloodPressure] = entry.bloodPressure.split('/').map(Number);
        return {
            systolicBloodPressure,
            diastolicBloodPressure,
            sGrade: entry.sGrade,
            sClass: entry.sClass,
            sNumber: entry.sNumber,
            sGender: entry.sGender,
            sName: entry.sName,
        };
    });

    const generateRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const CustomBloodSugarTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const student = payload[0].payload;
            return (
                <div className="custom-tooltip" style={{ backgroundColor: "#fff", padding: "10px", border: "1px solid #ccc" }}>
                    <p className="label font-weight-bold">{`${student.sGrade}학년 ${student.sClass}반 ${student.sNumber}번 ${student.sGender} ${student.sName}`}</p>
                    <p className="intro" style={{ color: '#EC5353'}}>{`혈당: ${student.bloodSugar}`}</p>
                </div>
            );
        }

        return null;
    };

    const groupedBloodSugarData = {};

    if (dataLoaded) {
        workNoteData.forEach(entry => {
            if (entry.bloodSugar > 0) {
                const key = `${entry.sGrade}-${entry.sClass}-${entry.sNumber} ${entry.sName}`;
                if (!groupedBloodSugarData[key]) {
                    groupedBloodSugarData[key] = [];
                }
                groupedBloodSugarData[key].push({
                    date: moment(entry.visitDateTime).format('YYYY-MM-DD'),
                    bloodSugar: entry.bloodSugar,
                    sGrade: entry.sGrade,
                    sClass: entry.sClass,
                    sNumber: entry.sNumber,
                    sGender: entry.sGender,
                    sName: entry.sName
                });
            }
        });
    }

    // 학생별 색상 매핑
    const studentColors = Object.keys(groupedBloodSugarData).reduce((acc, student) => {
        acc[student] = generateRandomColor();
        return acc;
    }, {});

    return (
        <>
            <div className="content" style={{ height: '84.1vh', display: 'flex', flexDirection: 'column' }}>
                <Row className="pl-3 pr-3" style={{ marginBottom: '-5px' }}>
                    <Table bordered className="stats-table text-center text-muted">
                        <thead>
                        <tr>
                            <th>감염증</th>
                            <th>구강치아계</th>
                            <th>근골격계</th>
                            <th>비뇨생식기계</th>
                            <th>소화기계</th>
                            <th>순환기계</th>
                            <th>안과계</th>
                            <th>이비인후과계</th>
                            <th>정신신경계</th>
                            <th>피부피하계</th>
                            <th>호흡기계</th>
                            <th>기타</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{categoryCounts.감염증}</td>
                            <td>{categoryCounts.구강치아계}</td>
                            <td>{categoryCounts.근골격계}</td>
                            <td>{categoryCounts.비뇨생식기계}</td>
                            <td>{categoryCounts.소화기계}</td>
                            <td>{categoryCounts.순환기계}</td>
                            <td>{categoryCounts.안과계}</td>
                            <td>{categoryCounts.이비인후과계}</td>
                            <td>{categoryCounts.정신신경계}</td>
                            <td>{categoryCounts.피부피하계}</td>
                            <td>{categoryCounts.호흡기계}</td>
                            <td>{categoryCounts.기타}</td>
                        </tr>
                        </tbody>
                    </Table>
                </Row>
                <Row className="d-flex no-gutters w-100" style={{ flex: '1 1 auto' }}>
                    <Col className="mr-2" style={{ width: '49%' }}>
                        <Card style={{ border: '1px solid lightgray', height: '95%' }}>
                            <div style={{ padding: '10px', borderBottom: '1px dashed lightgray', textAlign: 'center', fontWeight: 'bold' }}>
                                <Row className="d-flex align-items-center no-gutters">
                                    <Col className="d-flex justify-content-start pl-3">
                                        시간대별 남·여 학생 보건실 방문 수
                                    </Col>
                                    <Col className="d-flex justify-content-end">
                                        <ButtonGroup size="sm">
                                            <Button className="mt-0 mb-0">일주일</Button>
                                            <Button className="mt-0 mb-0">한달</Button>
                                            <Button className="mt-0 mb-0">6개월</Button>
                                            <Button className="mt-0 mb-0">전체</Button>
                                        </ButtonGroup>
                                    </Col>
                                </Row>
                            </div>
                            <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart
                                        width={500}
                                        height={300}
                                        data={fullHourlyData}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" label={{ value: '시간', position: 'insideRight', offset: -30 }}/>
                                        <YAxis label={{ value: '인원 수', position: 'insideTopLeft', offset: -5 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="male" stackId="a" fill="#8884d8" />
                                        <Bar dataKey="female" stackId="a" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div style={{ width: '20%', padding: '10px', alignContent: 'center' }}>
                                    <div className="d-flex align-content-center mb-2">
                                        <span style={{ backgroundColor: '#8884d8', display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }}></span> 남학생
                                    </div>
                                    <div className="d-flex align-content-center">
                                        <span style={{ backgroundColor: '#82ca9d', display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }}></span> 여학생
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col className="ml-2" style={{ width: '49%' }}>
                        <Card style={{ border: '1px solid lightgray', height: '95%' }}>
                            <div style={{ padding: '10px', borderBottom: '1px dashed lightgray', textAlign: 'center', fontWeight: 'bold' }}>
                                <Row className="d-flex align-items-center no-gutters">
                                    <Col className="d-flex justify-content-start pl-3">
                                        학생별 보건실 방문 빈도 수
                                    </Col>
                                    <Col className="d-flex justify-content-end">
                                        <ButtonGroup size="sm">
                                            <Button className="mt-0 mb-0">일주일</Button>
                                            <Button className="mt-0 mb-0">한달</Button>
                                            <Button className="mt-0 mb-0">6개월</Button>
                                            <Button className="mt-0 mb-0">전체</Button>
                                        </ButtonGroup>
                                    </Col>
                                </Row>
                            </div>
                            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart
                                        layout="vertical"
                                        width={500}
                                        height={300}
                                        data={sortedStudentVisitData.length ? sortedStudentVisitData: [{ name: '', visits: 0 }]}
                                        margin={{
                                            top: 20,
                                            right: 35,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" dataKey="visits" label={{ value: '빈도', position: 'insideRight', offset: 0, dx: 35, dy: -1.5 }}/>
                                        <YAxis type="category" dataKey="name" label={{ value: '학생 이름', position: 'insideTopLeft', offset: 0, dy: -10 }} interval={0} tickCount={10} />
                                        <Tooltip content={<CustomVisitTooltip />} />
                                        <Bar dataKey="visits">
                                            {sortedStudentVisitData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index < 5 ? '#EC5353' : '#ECD253'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                                <div style={{ width: '20%', padding: '10px', alignContent: 'center' }}>
                                    <div className="d-flex align-content-center mb-2">
                                        <span style={{ backgroundColor: '#EC5353', display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }}></span> 상위 빈도 방문
                                    </div>
                                    <div className="d-flex align-content-center">
                                        <span style={{ backgroundColor: '#ECD253', display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }}></span> 하위 빈도 방문
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
                <Row className="d-flex no-gutters w-100" style={{ flex: '1 1 auto'}}>
                    <Col className="mr-2" style={{ maxWidth: '39%' }}>
                        <Card style={{ border: '1px solid lightgray', height: '100%' }}>
                            <div style={{ padding: '10px', borderBottom: '1px dashed lightgray', textAlign: 'center', fontWeight: 'bold' }}>
                                <Row className="d-flex align-items-center no-gutters">
                                    <Col className="d-flex justify-content-start pl-3">
                                        인체 부위별 보건일지 누적 등록 수
                                    </Col>
                                    <Col className="d-flex justify-content-end">
                                        <ButtonGroup size="sm">
                                            <Button className="mt-0 mb-0">일주일</Button>
                                            <Button className="mt-0 mb-0">한달</Button>
                                            <Button className="mt-0 mb-0">6개월</Button>
                                            <Button className="mt-0 mb-0">전체</Button>
                                        </ButtonGroup>
                                    </Col>
                                </Row>

                            </div>
                            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                                <ResponsiveContainer width="100%" height={320}>
                                    <PieChart>
                                        <Pie
                                            data={bodyPartsData.length ? bodyPartsData : [{ name: '등록된 데이터 없음', value: 1 }]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                            outerRadius={150}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {sortedBodyPartsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ width: '30%', padding: '10px', alignContent: 'center' }}>
                                    {(sortedBodyPartsData.length ? sortedBodyPartsData : [{ name: '데이터 없음', value: 1 }]).map((entry, index) => (
                                        <div key={`legend-${index}`} className="d-flex align-content-center mb-2">
                                            <span style={{ backgroundColor: COLORS[index % COLORS.length], display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }}></span>
                                            {entry.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col className="ml-2" style={{ maxWidth: '60%' }}>
                        <Card style={{ border: '1px solid lightgray', height: '100%' }}>
                            <div style={{ padding: '10px', borderBottom: '1px dashed lightgray', textAlign: 'center', fontWeight: 'bold' }}>
                                <Row className="d-flex align-items-center no-gutters">
                                    <Col className="d-flex justify-content-start pl-3">
                                        학생별 혈압 분포도 및 혈당 추세선
                                    </Col>
                                    <Col className="d-flex justify-content-end">
                                        <ButtonGroup size="sm">
                                            <Button className="mt-0 mb-0">일주일</Button>
                                            <Button className="mt-0 mb-0">한달</Button>
                                            <Button className="mt-0 mb-0">6개월</Button>
                                            <Button className="mt-0 mb-0">전체</Button>
                                        </ButtonGroup>
                                    </Col>
                                </Row>
                            </div>
                            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingRight: 25 }}>
                                <ResponsiveContainer width="48%" height={290} style={{ marginTop: 30 }}>
                                    <ScatterChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                                        <CartesianGrid />
                                        <XAxis type="number" dataKey="systolicBloodPressure" name="수축기 혈압" domain={[0, 200]} label={{ value: '수축 혈압', position: 'insideRight', offset: 0, dy: 12, dx: 13 }} />
                                        <YAxis type="number" dataKey="diastolicBloodPressure" name="이완기 혈압" domain={[0, 150]} label={{ value: '이완 혈압', position: 'insideTopLeft', offset: 0, dy: -19 }} />
                                        <Tooltip content={<CustomBloodPressureTooltip />} />
                                        <Scatter name="학생" data={bloodPressureData} fill="#EC5353" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                                <ResponsiveContainer width="48%" height={290} style={{ marginTop: 30 }}>
                                    <LineChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" domain={['dataMin', 'dataMax']} label={{ value: '날짜', position: 'insideRight', offset: 0, dy: 12, dx: 20 }} />
                                        <YAxis domain={[0, 200]} label={{ value: '혈당', position: 'insideTopLeft', offset: 0, dy: -19, dx: 28 }} />
                                        <Tooltip content={<CustomBloodSugarTooltip />} />
                                        {Object.keys(groupedBloodSugarData).map((key) => (
                                            <Line
                                                key={key}
                                                type="monotone"
                                                data={groupedBloodSugarData[key]}
                                                dataKey="bloodSugar"
                                                stroke={studentColors[key]}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default Statistics;