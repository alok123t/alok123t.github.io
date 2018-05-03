#include <algorithm>
#include <iostream>
#include <fstream>
#include <queue>
#include <string>
#include <vector>

struct Point {
    int _x, _y;
    Point(const int &x, const int &y) {
        _x = x;
        _y = y;
    }
    Point& operator=(const Point &p) {
        _x = p._x;
        _y = p._y;
        return *this;
    }
    bool operator==(const Point &p) const {
        return _x == p._x && _y == p._y;
    }
};

class Polygon {
public:    
    Polygon(const std::vector <Point> &vertices) {
        _vertices = vertices;
    }
    int getTriangulation(std::vector <std::pair<Point, Point> > *t_edges) {
        int n = _vertices.size();
        std::vector< std::vector <std::pair<double, int> > > dp_table(n, \
            std::vector<std::pair<double, int> > (n));
        double cur_cost;
        for (int gap = 0; gap < n; gap++) {
            for (int i = 0, j = gap; j < n; i++, j++) {
                if (j < i+2) {
                    dp_table[i][j] = {0.0, -1};
                    continue;
                }
                dp_table[i][j] = {INT_MAX, -1};
                for (int k = i+1; k < j; k++) {
                cur_cost = dp_table[i][k].first + dp_table[k][j].first + cost(i, k, j);
                    if (cur_cost < dp_table[i][j].first) {
                        dp_table[i][j] = {cur_cost, k};
                    }
                }
            }
        }
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                std::cout << dp_table[i][j].first << ' ';
            }
            std::cout << '\n';
        }
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                std::cout << dp_table[i][j].second << ' ';
            }
            std::cout << '\n';
        }
        std::queue <std::pair<int, int> > q;
        std::pair<int, int> top;
        int a, b, c;
        q.push({0, n-1});
        while(!q.empty()) {
            top = q.front();
            q.pop();
            a = top.first;
            b = top.second;
            c = dp_table[a][b].second;
            std::cout << a << ' ' << b << ' ' << c << '\n';
            if (a != c-1) q.push({a, c});
            if (c != b-1) q.push({c, b});
        }
        return 0;
    }
private:
    std::vector<Point> _vertices;

    double dist(int p1, int p2) {
        return (_vertices[p1]._x-_vertices[p2]._x)*(_vertices[p1]._x-_vertices[p2]._x) \
            + (_vertices[p1]._y-_vertices[p2]._y)*(_vertices[p1]._y-_vertices[p2]._y);
    }

    double cost_min(int p1, int p2, int p3) {
        return std::max(dist(p1, p2), std::max(dist(p2, p3), dist(p3, p1)));
    }

    double cost(int p1, int p2, int p3) {
        return dist(p1, p2) + dist(p2, p3) + dist(p3, p1);
    }

    bool checkCollinear(Point p1, Point p2, Point p3) {
        return p1._x*(p2._y - p3._y) - p2._x*(p3._y - p1._y) + p3._x*(p1._y - p2._y) == 0;
    }

    bool checkIntersection(Point cur, Point prv) {
        return true;
    }

    /*  
        After adding new point p, polygon should still be simple
        Trivial check <= 2
        p should not form a straight line with prv two points (since triangle area = 0 formed by the new point added)
        line from prv point and p should not intersect any other prv lines (except at the start point - for closing polygon)
    */
    bool checkSimplePolygon(Point p) {
        // if (_vertices.size() <= 2) return true;
        // else {
        //     if (checkCollinear(p, _vertices.rbegin()[0], _vertices.rbegin[1]))
        //         return false;
        //     if (checkIntersection(p, _vertices.rbegin[0]));
        // }
        return true;
    }
};

void Reader(const std::string f_name, std::vector <Point> *f_vertices) {
    std::fstream fs;
    fs.open(f_name, std::fstream::in);
    int f_n, x, y;
    fs >> f_n;
    for (int i = 0; i < f_n; i++) {
        fs >> x >> y;
        (*f_vertices).push_back(Point(x, y));
    }
    fs.close();
}

int main(int argc, char *argv[])
{
    if (argc < 2) {
        printf("Usage: ./triangulation <file-name>\n");
        return EXIT_FAILURE;
    }
    std::vector <Point> vertices;
    std::vector <std::pair<Point, Point> > t_edges;
    Reader(std::string(argv[1]), &vertices);
    
    Polygon *p = new Polygon(vertices);
    (*p).getTriangulation(&t_edges);
    return EXIT_SUCCESS;
}